var _                        = require('underscore');
var connect                  = require('react-redux').connect;
var createStructuredSelector = require('reselect').createStructuredSelector;
var React                    = require('react');

var dom       = require('../../utils/dom');
var styles    = require('./Hovercards.styles');
var urls      = require('../../integrations/urls');
var Hovercard = require('../Hovercard/Hovercard');

var TIMEOUT_BEFORE_CARD = 500;

// TODO This is probably the grossest file that is getting reformated. Cleanup?

function acceptEntity(entity, element, parents) {
	return entity.api !== document.domain.replace(/\.com$/, '').replace(/^.*\./, '') ||
		(
			entity.api === 'imgur' &&
			entity.type === 'account' &&
			!dom.hasClass(element, 'account-user-name') &&
			_.chain(parents)
				.every(function(parent) {
					return dom.hasClass(parent, 'options') || dom.hasClass(parent, 'user-dropdown');
				})
				.isEmpty()
				.value()
		) ||
		(
			entity.api === 'instagram' &&
			entity.type === 'account' &&
			!dom.hasClass(element, '-cx-PRIVATE-Navigation__menuLink') &&
			_.chain(parents)
				.every(function(parent) {
					return dom.hasClass(parent, 'dropdown');
				})
				.isEmpty()
				.value()
		) ||
		(
			entity.api === 'reddit' &&
			(
				entity.type === 'account' ?
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
			entity.api === 'twitter' &&
			entity.type === 'account' &&
			document.domain === 'tweetdeck.twitter.com'
		);
}

module.exports = connect(createStructuredSelector({
	options: _.property('options')
}))(React.createClass({
	displayName: 'Hovercards',
	propTypes:   {
		dispatch: React.PropTypes.func.isRequired,
		options:  React.PropTypes.object.isRequired
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
		var entity;
		for (var i = 0; i < checks.length && !entity; i++) {
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
			entity = urls.parse(url);
			if (!entity) {
				continue;
			}
			if (check.element === element && !acceptEntity(entity, element, parents)) {
				entity = null;
			}
		}
		if (!entity) {
			return;
		}
		this.waitForHovercard(element, entity, event);
	},
	waitForHovercard: function(element, entity, event) {
		var timeout = setTimeout(function() {
			cleanup();
			this.setState({
				hovercards:     this.state.hovercards.concat({ key: this.state.incrementingId, element: element, entity: entity, event: event }),
				incrementingId: this.state.incrementingId + 1
			});
		}.bind(this), TIMEOUT_BEFORE_CARD);

		element.addEventListener('mouseleave', abandon);
		element.addEventListener('mousemove', updateEvent);
		window.addEventListener('blur', abandon);

		var that = this; // FIXME

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
			<div className={styles.hovercards} ref="hovercards">
				{this.state.hovercards.map(function(hovercard) {
					return <Hovercard key={hovercard.key} entity={hovercard.entity} element={hovercard.element} event={hovercard.event}
						onClose={_.partial(this.removeHovercard, hovercard)} />;
				}.bind(this))}
			</div>
		);
	}
}));
