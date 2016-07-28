var compose = require('redux').compose;
var React   = require('react');

var dom    = require('../../utils/dom');
var styles = require('./Hovercard.styles');

var PADDING_FROM_EDGES   = 10;
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
		window.addEventListener('scroll', this.positionHovercard);
		window.addEventListener('resize', this.positionHovercard);
		this.positionHovercard();
	},
	componentWillUnmount: function() {
		this.props.element.removeEventListener('click', this.closeHovercard);
		this.props.element.removeEventListener('mousemove', this.clearCloseTimeout);
		this.props.element.removeEventListener('mouseleave', this.setCloseTimeout);
		window.removeEventListener('blur', this.onWindowBlur);
		window.removeEventListener('scroll', this.positionHovercard);
		window.removeEventListener('resize', this.positionHovercard);
	},
	render: function() {
		return (
			<div className={styles.hovercardContainer} style={this.state}>
				<div className={styles.hovercard} ref="hovercard" onMouseMove={compose(this.lockScrolling, this.clearCloseTimeout)} onMouseLeave={compose(this.unlockScrolling, this.setCloseTimeout)}>
					<a>HoverCard, hear me roar!</a><br />
					<pre>{JSON.stringify(this.props.entity, null, 4)}</pre>
				</div>
			</div>
		);
	},
	positionHovercard: function() {
		this.setState({
			top: Math.max(
				window.scrollY + PADDING_FROM_EDGES, // Keep the hovercard from going off the top of the page
				Math.min(
					window.scrollY + window.innerHeight - this.refs.hovercard.offsetHeight - PADDING_FROM_EDGES, // Keep the hovercard from going off the bottom of the page
					this.props.event.pageY - Math.min(
						this.refs.hovercard.offsetHeight / 2, // Keep the hovercard from being above the cursor
						70 // Start the hovercard offset above the cursor
					)
				)
			),
			left: Math.max(
				window.scrollX + PADDING_FROM_EDGES, // Keep the hovercard from going off the left of the page
				this.props.event.pageX + (
					(this.props.event.pageX + 1 > window.scrollX + window.innerWidth - this.refs.hovercard.offsetWidth - PADDING_FROM_EDGES) ?
						-this.refs.hovercard.offsetWidth - 1 :// Keep the hovercard from going off the right of the page by putting it on the left
						1 // Put the hovercard on the right
				)
			)
		});
	},
	setCloseTimeout: function(event) {
		var element = event.relatedTarget;
		while (element && element !== document.documentElement) {
			if (element === this.element && element === this.refs.hovercard) {
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
			if (element === this.refs.hovercard) {
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
		dom.addClass(document.documentElement, styles.hideScrollbar);
		dom.addClass(document.body, styles.hideScrollbar + ' ' + styles.overflowHidden);
	},
	unlockScrolling: function() {
		if (!this.state.locked) {
			return;
		}
		this.setState({ locked: false });
		dom.removeClass(document.documentElement, styles.hideScrollbar);
		dom.removeClass(document.body, styles.hideScrollbar + ' ' + styles.overflowHidden);
	}
});
