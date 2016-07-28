var React = require('react');

var hasClass = require('../../utils/has-class');
var styles   = require('./Hovercard.styles');

var TIMEOUT_BEFORE_CLOSE = 100;

module.exports = React.createClass({
	displayName: 'Hovercard',
	propTypes:   {
		element: React.PropTypes.object.isRequired,
		entity:  React.PropTypes.object.isRequired,
		event:   React.PropTypes.object.isRequired,
		onClose: React.PropTypes.func.isRequired
	},
	getInitialState: function() {
		return { locked: false };
	},
	componentDidMount: function() {
		this.props.element.addEventListener('click', this.closeHovercard);
		this.props.element.addEventListener('mousemove', this.clearCloseTimeout);
		this.props.element.addEventListener('mouseleave', this.setCloseTimeout);
		window.addEventListener('blur', this.onWindowBlur);
	},
	componentWillUnmount: function() {
		this.props.element.removeEventListener('click', this.closeHovercard);
		this.props.element.removeEventListener('mousemove', this.clearCloseTimeout);
		this.props.element.removeEventListener('mouseleave', this.setCloseTimeout);
		window.removeEventListener('blur', this.onWindowBlur);
	},
	render: function() {
		return (
			<div className={styles.hovercard}>
				<div className={styles.hovercardBox} onMouseMove={this.onHovercardMouseMove} onMouseLeave={this.onHovercardMouseLeave}>
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
	onHovercardMouseMove: function() {
		this.clearCloseTimeout();
		this.lockScrolling();
	},
	onHovercardMouseLeave: function(event) {
		this.setCloseTimeout(event);
		this.unlockScrolling();
	},
	setCloseTimeout: function(event) {
		var element = event.relatedTarget;
		while (element && element !== document.documentElement) {
			if (element === this.element && hasClass(element, styles.hovercard)) {
				return;
			}
			element = element.parentNode;
		}
		this.closeTimeout = setTimeout(this.closeHovercard, TIMEOUT_BEFORE_CLOSE);
	},
	clearCloseTimeout: function() {
		clearTimeout(this.closeTimeout);
	},
	onWindowBlur: function() {
		if (document.activeElement.tagName.toLowerCase() === 'iframe') {
			return;
		}
		var element = document.activeElement;
		while (element !== document.documentElement) {
			if (hasClass(element, styles.hovercard)) {
				return;
			}
			element = element.parentNode;
		}
		this.closeHovercard();
	},
	closeHovercard: function() {
		if (process.env.NODE_ENV !== 'production' && process.env.STICKYCARDS) {
			return;
		}
		this.unlockScrolling();
		this.props.onClose();
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
	unlockScrolling: function() {
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
	if (!hasClass(element, className)) {
		element.className += ' ' + className;
	}
}

function removeClass(element, className) {
	if (hasClass(element, className)) {
		element.className = element.className.replace(new RegExp('\\s*' + className, 'g'), '');
	}
}
