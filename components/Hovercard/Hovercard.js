var React = require('react');

var styles = require('./Hovercard.styles');

module.exports = React.createClass({
	displayName:     'Hovercard',
	getInitialState: function() {
		return { locked: false };
	},
	render: function() {
		return (
			<div className={styles.hovercard}>
				<div className={styles.hovercardBox} onMouseMove={this.lockScrolling} onMouseLeave={this.unLockScrolling}>
					<a>HoverCard, hear me roar!</a><br />
					HoverCard, hear me roar!<br />
					HoverCard, hear me roar!<br />
					HoverCard, hear me roar!<br />
					HoverCard, hear me roar!<br />
					HoverCard, hear me roar!<br />
					HoverCard, hear me roar!<br />
					HoverCard, hear me roar!<br />
					HoverCard, hear me roar!<br />
					HoverCard, hear me roar!<br />
					HoverCard, hear me roar!<br />
					HoverCard, hear me roar!<br />
					HoverCard, hear me roar!<br />
					HoverCard, hear me roar!<br />
					HoverCard, hear me roar!<br />
					HoverCard, hear me roar!<br />
					HoverCard, hear me roar!<br />
					HoverCard, hear me roar!<br />
					HoverCard, hear me roar!<br />
					HoverCard, hear me roar!<br />
					HoverCard, hear me roar!<br />
					HoverCard, hear me roar!<br />
					HoverCard, hear me roar!<br />
					HoverCard, hear me roar!<br />
					HoverCard, hear me roar!<br />
					HoverCard, hear me roar!<br />
					HoverCard, hear me roar!<br />
					HoverCard, hear me roar!<br />
					HoverCard, hear me roar!<br />
					HoverCard, hear me roar!<br />
					HoverCard, hear me roar!<br />
					HoverCard, hear me roar!<br />
					HoverCard, hear me roar!<br />
					HoverCard, hear me roar!<br />
					HoverCard, hear me roar!<br />
					HoverCard, hear me roar!<br />
					HoverCard, hear me roar!<br />
					HoverCard, hear me roar!<br />
					HoverCard, hear me roar!<br />
					HoverCard, hear me roar!<br />
					HoverCard, hear me roar!<br />
					HoverCard, hear me roar!<br />
					HoverCard, hear me roar!<br />
					HoverCard, hear me roar!<br />
					HoverCard, hear me roar!<br />
					HoverCard, hear me roar!<br />
					HoverCard, hear me roar!<br />
					HoverCard, hear me roar!<br />
					HoverCard, hear me roar!<br />
					HoverCard, hear me roar!<br />
					HoverCard, hear me roar!<br />
					HoverCard, hear me roar!<br />
					HoverCard, hear me roar!<br />
					HoverCard, hear me roar!<br />
				</div>
			</div>
		);
	},
	lockScrolling: function() {
		if (this.state.locked) {
			return;
		}
		this.setState({ locked: true });
		addClass(document.documentElement, styles.hideScrollbar);
		addClass(document.body, styles.hideScrollbar);
		addClass(document.body, styles.overflowHidden);
	},
	unLockScrolling: function() {
		if (!this.state.locked) {
			return;
		}
		this.setState({ locked: false });
		removeClass(document.documentElement, styles.hideScrollbar);
		removeClass(document.body, styles.hideScrollbar);
		removeClass(document.body, styles.overflowHidden);
	}
});

function addClass(element, className) {
	if (!element.className.includes(className)) {
		element.className += ' ' + className;
	}
}

function removeClass(element, className) {
	if (element.className.includes(className)) {
		element.className = element.className.replace(new RegExp('\\s*' + className, 'g'), '');
	}
}
