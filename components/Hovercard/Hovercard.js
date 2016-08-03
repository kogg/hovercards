var React      = require('react');
var classnames = require('classnames');
var compose    = require('redux').compose;

var AccountHovercard = require('../AccountHovercard/AccountHovercard');
var ContentHovercard = require('../ContentHovercard/ContentHovercard');
var dom              = require('../../utils/dom');
var entityLabel      = require('../../utils/entity-label');
var styles           = require('./Hovercard.styles');

var PADDING_FROM_EDGES   = 10;
var TIMEOUT_BEFORE_CLOSE = 100;

module.exports = React.createClass({
	displayName: 'Hovercard',
	propTypes:   {
		analytics:    React.PropTypes.func.isRequired,
		authenticate: React.PropTypes.func.isRequired,
		className:    React.PropTypes.string,
		element:      React.PropTypes.object.isRequired,
		entity:       React.PropTypes.object,
		event:        React.PropTypes.object.isRequired,
		getEntity:    React.PropTypes.func.isRequired,
		request:      React.PropTypes.object.isRequired,
		onClose:      React.PropTypes.func.isRequired
	},
	getInitialState: function() {
		return { hovered: false, offset: {} };
	},
	componentDidMount: function() {
		this.props.element.addEventListener('click', this.closeHovercard);
		this.props.element.addEventListener('mousemove', this.clearCloseTimeout);
		this.props.element.addEventListener('mouseleave', this.setCloseTimeout);
		window.addEventListener('blur', this.onWindowBlur);
		window.addEventListener('scroll', this.positionHovercard);
		window.addEventListener('resize', this.positionHovercard);
		this.positionHovercard();
		this.props.getEntity(this.props.request);
		if (this.props.entity && (this.props.entity.loaded || this.props.entity.err)) {
			this.loadedTime = Date.now();
		}
	},
	componentDidUpdate: function(prevProps) {
		if (this.loadedTime) {
			return;
		}
		if (prevProps.entity && (prevProps.entity.loaded || prevProps.entity.err)) {
			return;
		}
		if (!this.props.entity || (!this.props.entity.loaded && !this.props.entity.err)) {
			return;
		}
		this.loadedTime = Date.now();
	},
	componentWillUnmount: function() {
		if (this.loadedTime) {
			this.props.analytics(['send', 'timing', entityLabel(this.props.entity), 'Showing hovercard', Date.now() - this.loadedTime, this.props.entity.err && 'error hovercard']);
		}
		this.props.element.removeEventListener('click', this.closeHovercard);
		this.props.element.removeEventListener('mousemove', this.clearCloseTimeout);
		this.props.element.removeEventListener('mouseleave', this.setCloseTimeout);
		window.removeEventListener('blur', this.onWindowBlur);
		window.removeEventListener('scroll', this.positionHovercard);
		window.removeEventListener('resize', this.positionHovercard);
	},
	positionHovercard: function() {
		if (!this.isMounted()) {
			// FIXME Anti-pattern
			return;
		}
		this.setState(function() {
			return {
				offset: {
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
				}
			};
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
	closeHovercard: function() {
		if (process.env.NODE_ENV !== 'production' && process.env.STICKYCARDS) {
			return;
		}
		this.onUnHovered();
		this.props.onClose();
	},
	onHovered: function() {
		if (this.state.hovered) {
			return;
		}
		this.setState({ hovered: true });
		dom.addClass(document.documentElement, styles.lockDocument);
		dom.addClass(document.body, styles.lockBody);
	},
	onUnHovered: function() {
		if (!this.state.hovered) {
			return;
		}
		this.setState({ hovered: false });
		dom.removeClass(document.documentElement, styles.lockDocument);
		dom.removeClass(document.body, styles.lockBody);
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
	render: function() {
		var entityOrRequest = this.props.entity || this.props.request;

		return (
			<div className={classnames(styles.hovercard, this.props.className)} style={this.state.offset} ref="hovercard"
				onMouseMove={compose(this.onHovered, this.clearCloseTimeout)}
				onMouseLeave={compose(this.onUnHovered, this.setCloseTimeout)}>
				{
					entityOrRequest.type === 'content' ?
						<ContentHovercard content={entityOrRequest}
							hovered={this.state.hovered}
							authenticate={this.props.authenticate}
							getEntity={this.props.getEntity}
							onResize={this.positionHovercard} /> :
						<AccountHovercard account={entityOrRequest}
							hovered={this.state.hovered}
							authenticate={this.props.authenticate}
							getEntity={this.props.getEntity}
							onResize={this.positionHovercard} />
				}
			</div>
		);
	}
});
