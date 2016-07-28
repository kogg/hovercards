var _     = require('underscore');
var React = require('react');

var styles    = require('./Hovercards.styles');
var urls      = require('../../integrations/urls');
var Hovercard = require('../Hovercard/Hovercard');

var TIMEOUT_BEFORE_CARD = 500;

// TODO This is probably the grossest file that is getting reformated. Cleanup?

module.exports = React.createClass({
	displayName:     'Hovercards',
	getInitialState: function() {
		return { hovercards: [], incrementingId: 0 };
	},
	componentDidMount: function() {
		document.documentElement.addEventListener('mousemove', this.considerElement);
	},
	componentWillUnmount: function() {
		document.documentElement.removeEventListener('mousemove', this.considerElement);
	},
	render: function() {
		return (
			<div className={styles.hovercards}>
				{this.state.hovercards.map(function(hovercard) {
					return <Hovercard key={hovercard.key} />;
				})}
			</div>
		);
	},
	considerElement: function(event) {
		var element = event.target;
		while (!_.contains(['A', 'IFRAME'], element.nodeName.toUpperCase())) {
			if (element === document.documentElement || element.className.includes(styles.hovercards) || element.className.includes('no-hovercards') || element.className.includes('hoverZoomLink')) {
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
			if (currentParent.className.includes(styles.hovercards) || currentParent.className.includes('no-hovercards') || currentParent.className.includes('hoverZoomLink')) {
				return;
			}
			currentParent = currentParent.parentNode;
		}
		var url;
		switch (element.nodeName.toUpperCase()) {
			case 'A':
				url = element.dataset.expandedUrl || element.dataset.href || element.dataset.fullUrl || element.href;
				break;
			case 'IFRAME':
				var match = element.src.match(/[?&]screen_name=([a-zA-Z0-9_]+)(?:&|$)/);
				if (!match || !match[1]) {
					break;
				}
				url = 'https://twitter.com/' + match[1];
				break;
			default:
				break;
		}
		url = massageUrl(url);
		if (!url) {
			return;
		}
		var entity = urls.parse(url);
		if (!entity || !acceptEntity(entity, element, parents)) {
			return;
		}
		// FIXME Need hovercards/ever-frame reddit comments magic && disabled logic
		console.log('really passed the trials', entity, element.nodeName);
		this.waitForHovercard(element, entity, event);
	},
	waitForHovercard: function(element, entity, event) {
		var timeout = setTimeout(function() {
			cleanup();
			console.log('BEHOLD!!!!');
			this.setState(function(previousState) {
				return {
					hovercards:     previousState.hovercards.concat({ key: previousState.incrementingId, element: element, entity: entity, event: event }),
					incrementingId: previousState.incrementingId + 1
				};
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
	}
});

function acceptEntity(entity, element, parents) {
	return entity.api !== document.domain.replace(/\.com$/, '').replace(/^.*\./, '') ||
		(
			entity.api === 'imgur' &&
			entity.type === 'account' &&
			!element.className.includes('account-user-name') &&
			_.chain(parents)
				.every(function(parent) {
					return parent.className.includes('options') || parent.className.includes('user-dropdown');
				})
				.isEmpty()
				.value()
		) ||
		(
			entity.api === 'instagram' &&
			entity.type === 'account' &&
			!element.className.includes('-cx-PRIVATE-Navigation__menuLink') &&
			_.chain(parents)
				.every(function(parent) {
					return parent.className.includes('dropdown');
				})
				.isEmpty()
				.value()
		) ||
		(
			entity.api === 'reddit' &&
			(
				entity.type === 'account' ?
					!document.body.className.includes('res') &&
					_.chain(parents)
						.every(function(parent) {
							return parent.className.includes('tabmenu') || parent.className.includes('user');
						})
						.isEmpty()
						.value() :
					!element.className.includes('search-comments') && !element.className.includes('comments')
			)
		) ||
		(
			entity.api === 'twitter' &&
			entity.type === 'account' &&
			document.domain === 'tweetdeck.twitter.com'
		);
}

function massageUrl(url) {
	if (!url) {
		return null;
	}
	if (url === '#') {
		return null;
	}
	if (url.match(/^javascript:.*/)) {
		return null;
	}
	var a = document.createElement('a');
	a.href = url;
	url = a.href;
	a.href = '';
	if (a.remove) {
		a.remove();
	}
	if (url === document.URL + '#') {
		return null;
	}
	return url;
}
