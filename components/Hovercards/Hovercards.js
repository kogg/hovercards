var _                        = require('underscore');
var React                    = require('react');
var connect                  = require('react-redux').connect;
var createStructuredSelector = require('reselect').createStructuredSelector;

require('./Hovercards.styles');
var Hovercard   = require('../Hovercard/Hovercard');
var actions     = require('../../redux/actions');
var dom         = require('../../utils/dom');
var entityLabel = require('../../utils/entity-label');
var urls        = require('../../integrations/urls');

var TIMEOUT_BEFORE_CARD = 500;

module.exports = connect(
	createStructuredSelector({
		entities: _.property('entities'),
		options:  _.property('options')
	}),
	actions
)(React.createClass({
	displayName: 'Hovercards',
	propTypes:   {
		className: React.PropTypes.string,
		entities:  React.PropTypes.object.isRequired,
		options:   React.PropTypes.object.isRequired
	},
	getInitialState: function() {
		return { hovercards: [], incrementingId: 0 };
	},
	componentDidMount: function() {
		document.documentElement.addEventListener('mousemove', this.considerElement);
	},
	componentWillUnmount: function() {
		document.documentElement.removeEventListener('mousemove', this.considerElement);
	},
	considerElement: function(event) {
		var element = event.target;
		while (!_.contains(['a', 'iframe'], element.nodeName.toLowerCase())) {
			if (element === document.documentElement || element === this.refs.hovercards || dom.hasClass(element, 'no-hovercards') || dom.hasClass(element, 'hoverZoomLink')) {
				return;
			}
			element = element.parentNode;
		}
		if (this.lastElement === element) {
			return;
		}
		this.lastElement = element;
		if (_.findWhere(this.state.hovercards, { element: element })) {
			return;
		}
		var parents = [];
		var currentParent = element;
		while (currentParent !== document.documentElement) {
			parents.push(currentParent);
			if (currentParent === this.refs.hovercards || dom.hasClass(currentParent, 'no-hovercards') || dom.hasClass(currentParent, 'hoverZoomLink')) {
				return;
			}
			currentParent = currentParent.parentNode;
		}
		var checks = [{ element: element }];
		if (this.props.options.reddit.content.enabled && document.location.hostname.endsWith('reddit.com') && dom.hasClass(element, 'title')) {
			var anotherElement = _.chain(element)
				.result('parentNode')
				.result('parentNode')
				.result('childNodes')
				.find(function(element) {
					return dom.hasClass(element, ['flat-list', 'buttons']);
				})
				.result('childNodes')
				.find(function(element) {
					return dom.hasClass(element, 'first');
				})
				.result('childNodes')
				.find(function(element) {
					return dom.hasClass(element, 'comments');
				})
				.value();
			if (anotherElement) {
				checks.push({ element: anotherElement });
			}
		}
		var request;
		for (var i = 0; i < checks.length && !request; i++) {
			var check = checks[i];
			var url;
			switch (check.element.nodeName.toLowerCase()) {
				case 'a':
					url = check.element.dataset.expandedUrl || check.element.dataset.href || check.element.dataset.fullUrl || check.element.href;
					break;
				case 'iframe':
					var match = check.element.src.match(/[?&]screen_name=([a-zA-Z0-9_]+)(?:&|$)/);
					if (!match || !match[1]) {
						break;
					}
					url = 'https://twitter.com/' + match[1];
					break;
				default:
					continue;
			}
			url = dom.massageUrl(url);
			if (!url) {
				continue;
			}
			request = urls.parse(url);
			if (!request) {
				continue;
			}
			if (!this.props.options[request.api][request.type].enabled || (check.element === element && !acceptRequest(request, element, parents))) {
				request = null;
			}
		}
		if (!request) {
			return;
		}
		this.waitForHovercard(element, request, event);
	},
	waitForHovercard: function(element, request, event) {
		var timeout = setTimeout(function() {
			cleanup();
			this.setState({
				hovercards:     this.state.hovercards.concat({ key: this.state.incrementingId, element: element, request: request, event: event }),
				incrementingId: this.state.incrementingId + 1
			});
		}.bind(this), TIMEOUT_BEFORE_CARD);

		element.addEventListener('mouseleave', abandon);
		element.addEventListener('mousemove', updateEvent);
		window.addEventListener('blur', abandon);

		var that = this;

		function abandon() {
			cleanup();
		}

		function cleanup() {
			element.removeEventListener('mouseleave', abandon);
			element.removeEventListener('mousemove', updateEvent);
			window.removeEventListener('blur', abandon);
			clearTimeout(timeout);
			timeout = null;
			that.lastElement = (that.lastElement !== element) && that.lastElement;
		}

		function updateEvent(newEvent) {
			event = newEvent;
		}
	},
	removeHovercard: function(hovercard) {
		this.setState({ hovercards: _.without(this.state.hovercards, hovercard) });
		this.lastElement = (this.lastElement !== hovercard.element) && this.lastElement;
	},
	render: function() {
		return (
			<div className={this.props.className} ref="hovercards">
				{this.state.hovercards.map(function(hovercard) {
					return <Hovercard key={hovercard.key}
						request={hovercard.request}
						entity={this.props.entities[entityLabel(hovercard.request)]}
						element={hovercard.element}
						event={hovercard.event}
						onClose={_.partial(this.removeHovercard, hovercard)} />;
				}.bind(this))}
			</div>
		);
	}
}));

function acceptRequest(request, element, parents) {
	return request.api !== document.domain.replace(/\.com$/, '').replace(/^.*\./, '') ||
		(
			request.api === 'imgur' &&
			request.type === 'account' &&
			!dom.hasClass(element, 'account-user-name') &&
			_.chain(parents)
				.every(function(parent) {
					return dom.hasClass(parent, 'options') || dom.hasClass(parent, 'user-dropdown');
				})
				.isEmpty()
				.value()
		) ||
		(
			request.api === 'reddit' &&
			(
				request.type === 'account' ?
					!dom.hasClass(document.body, 'res') &&
					_.chain(parents)
						.every(function(parent) {
							return dom.hasClass(parent, 'tabmenu') || dom.hasClass(parent, 'user');
						})
						.isEmpty()
						.value() :
					!dom.hasClass(element, 'search-comments') && !dom.hasClass(element, 'comments')
			)
		) ||
		(
			request.api === 'twitter' &&
			request.type === 'account' &&
			document.domain === 'tweetdeck.twitter.com'
		);
}
