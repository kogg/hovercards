var _          = require('underscore');
var React      = require('react');
var classnames = require('classnames');

var styles = require('./Carousel.styles');

module.exports = React.createClass({
	displayName: 'Carousel',
	propTypes:   {
		children:  React.PropTypes.arrayOf(React.PropTypes.node).isRequired,
		className: React.PropTypes.string,
		onChange:  React.PropTypes.func.isRequired,
		onResize:  React.PropTypes.func.isRequired
	},
	getInitialState: function() {
		return { index: 0 };
	},
	componentDidMount: function() {
		window.addEventListener('keydown', this.onWindowKeyDown);
	},
	componentWillUnmount: function() {
		window.addEventListener('keydown', this.onWindowKeyDown);
	},
	next: function(how) {
		var index = Math.min(this.props.children.length - 1, this.state.index + 1);
		this.setState({ index: index }, this.props.onResize);
		this.props.onChange(index, how);
	},
	previous: function(how) {
		var index = Math.max(0, this.state.index - 1);
		this.setState({ index: index }, this.props.onResize);
		this.props.onChange(index, how);
	},
	onWindowKeyDown: function(e) {
		switch (e.keyCode) {
			case 37:
			case 72:
				if (this.state.index === 0) {
					break;
				}
				this.previous('keydown');
				break;
			case 39:
			case 76:
				if (this.state.index === this.props.children.length - 1) {
					break;
				}
				this.next('keydown');
				break;
			default:
				break;
		}
	},
	render: function() {
		if (this.props.children.length === 0) {
			return null;
		}
		return (
			<div className={classnames(styles.carousel, this.props.className)}>
				{
					(this.props.children.length > 1) &&
					<div className={styles.arrows}>
						{(this.state.index > 0) && <div className={styles.leftArrow} onClick={_.partial(this.previous, 'click')} />}
						{(this.state.index < this.props.children.length - 1) && <div className={styles.rightArrow} onClick={_.partial(this.next, 'click')} />}
					</div>
				}
				{this.props.children[this.state.index]}
			</div>
		);
	}
});
