var _          = require('underscore');
var React      = require('react');
var classnames = require('classnames');
var connect    = require('react-redux').connect;

var AccountHovercard = require('../AccountHovercard/AccountHovercard');
var ContentHovercard = require('../ContentHovercard/ContentHovercard');
var actions          = require('../../redux/actions');
var dom              = require('../../utils/dom');
var entityLabel      = require('../../utils/entity-label');
var report           = require('../../report');
var styles           = require('./Hovercard.styles');
var urls             = require('../../integrations/urls');

var PADDING_FROM_EDGES   = 10;
var TIMEOUT_BEFORE_CLOSE = 100;

module.exports = connect(null, actions)(React.createClass({
	displayName: 'Hovercard',
	propTypes:   {
		analytics: React.PropTypes.func.isRequired,
		className: React.PropTypes.string,
		element:   React.PropTypes.object.isRequired,
		entity:    React.PropTypes.object,
		event:     React.PropTypes.object.isRequired,
		getEntity: React.PropTypes.func.isRequired,
		request:   React.PropTypes.object.isRequired,
		onClose:   React.PropTypes.func.isRequired
	},
	getInitialState: function() {
		return { hovered: false, offset: {} };
	},
	componentDidMount: function() {
		this.props.element.addEventListener('click', this.onClickElement);
		this.props.element.addEventListener('mousemove', this.clearCloseTimeout);
		this.props.element.addEventListener('mouseleave', this.setCloseTimeout);
		window.addEventListener('blur', this.onWindowBlur);
		window.addEventListener('scroll', this.positionHovercard);
		window.addEventListener('resize', this.positionHovercard);
		this.positionHovercard();
		this.props.getEntity(_.omit(this.props.request, 'meta'))
			.catch(report.error);
		this.mountedTime = Date.now();
		if (this.props.entity && (this.props.entity.loaded || this.props.entity.err)) {
			this.loadedTime = Date.now();
		}
		this.props.analytics(['send', 'event', entityLabel(this.props.entity || this.props.request, true), 'Hovercard Opened (exclude loading)', (this.props.entity || this.props.request).err && 'error hovercard'])
			.catch(report.error);
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
			this.props.analytics(['send', 'timing', entityLabel(this.props.entity, true), 'Hovercard Open (exclude loading)', Date.now() - this.loadedTime, this.props.entity.err && 'error hovercard'])
				.catch(report.error);
		}
		if (this.hasScrolled) {
			this.props.analytics(['send', 'event', entityLabel(this.props.entity, true), 'Hovercard Scrolled', this.props.entity.err && 'error hovercard', this.scrolledAmount])
				.catch(report.error);
		}
		this.props.element.removeEventListener('click', this.onClickElement);
		this.props.element.removeEventListener('mousemove', this.clearCloseTimeout);
		this.props.element.removeEventListener('mouseleave', this.setCloseTimeout);
		window.removeEventListener('blur', this.onWindowBlur);
		window.removeEventListener('scroll', this.positionHovercard);
		window.removeEventListener('resize', this.positionHovercard);
	},
	clearCloseTimeout: function() {
		clearTimeout(this.closeTimeout);
	},
	closeHovercard: function() {
		if (process.env.NODE_ENV !== 'production' && process.env.STICKYCARDS) {
			return;
		}
		this.onMouseLeave();
		this.props.onClose();
	},
	positionHovercard: function() {
		if (!this.isMounted()) {
			// HACK isMounted is an anti-pattern https://facebook.github.io/react/blog/2015/12/16/ismounted-antipattern.html
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
		this.setScrollPosition();
	},
	setCloseTimeout: function(e) {
		if (e) {
			var element = e.relatedTarget;
			while (element && element !== document.documentElement) {
				if (element === this.element && element === this.refs.hovercard) {
					return;
				}
				element = element.parentNode;
			}
		}
		this.closeTimeout = setTimeout(this.closeHovercard, TIMEOUT_BEFORE_CLOSE);
	},
	setScrollPosition: function(e) {
		this.hasScrolled = this.hasScrolled || Boolean(e);
		this.scrolledAmount = Math.max(this.scrolledAmount || 0, this.refs.hovercard.scrollTop);
	},
	onClick: function(e) {
		var element = e.target;
		while (element && element.tagName.toLowerCase() !== 'a') {
			if (element === this.refs.hovercard) {
				return;
			}
			element = element.parentNode;
		}
		if (!element.href) {
			return;
		}
		e.stopPropagation();
		if (element.target !== '_blank') {
			e.preventDefault();
			window.open(element.href);
		}
		var linkEntity = urls.parse(element.href);
		this.props.analytics(['send', 'event', entityLabel(this.props.entity || this.props.request, true), 'Link Opened', linkEntity && entityLabel(linkEntity, true)])
			.catch(report.error);
	},
	onClickElement: function() {
		this.closeHovercard();
		this.props.analytics(['send', 'event', entityLabel(this.props.entity || this.props.request, true), 'Original Link Opened'])
			.catch(report.error);
	},
	onMouseLeave: function(e) {
		if (!this.state.hovered) {
			return;
		}
		this.setCloseTimeout(e);
		this.setState({ hovered: false });
		dom.removeClass(document.documentElement, styles.lockDocument);
		dom.removeClass(document.body, styles.lockBody);
	},
	onMouseMove: function() {
		if (this.state.hovered) {
			return;
		}
		this.clearCloseTimeout();
		if (!this.firstHoveredTime) {
			this.firstHoveredTime = Date.now();
			this.props.analytics(['send', 'timing', entityLabel(this.props.entity || this.props.request, true), 'Until hovered on hovercard (include loading)', this.firstHoveredTime - this.mountedTime, (this.props.entity || this.props.request).err && 'error hovercard'])
				.catch(report.error);
		}
		this.setState({ hovered: true });
		dom.addClass(document.documentElement, styles.lockDocument);
		dom.addClass(document.body, styles.lockBody);
	},
	onWindowBlur: function() {
		if (document.activeElement.tagName.toLowerCase() === 'iframe') {
			return;
		}
		/*
		 * TODO https://github.com/teamkogg/hovercards/issues/14
		var element = document.activeElement;
		while (element !== document.documentElement) {
			if (element === this.refs.hovercard) {
				return;
			}
			element = element.parentNode;
		}
		*/
		this.closeHovercard();
	},
	render: function() {
		var entityOrRequest = this.props.entity || this.props.request;

		return (
			<div className={classnames(styles.hovercard, this.props.className)} style={this.state.offset} ref="hovercard"
				onClick={this.onClick}
				onMouseMove={this.onMouseMove}
				onMouseLeave={this.onMouseLeave}
				onScroll={this.setScrollPosition}>
				{
					entityOrRequest.type === 'content' ?
						<ContentHovercard content={entityOrRequest}
							meta={this.props.request.meta || {}}
							hovered={this.state.hovered}
							onResize={this.positionHovercard} /> :
						<AccountHovercard account={entityOrRequest}
							hovered={this.state.hovered}
							onResize={this.positionHovercard} />
				}
			</div>
		);
	}
}));
