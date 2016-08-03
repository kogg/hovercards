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
		this.props.onResize();
	},
	previous: function() {
		var index = Math.max(0, this.state.index - 1);
		this.setState({ index: index }, this.props.onResize);
		this.props.onChange(index, 'mouse');
	},
	next: function() {
		var index = Math.min(this.props.children.length - 1, this.state.index + 1);
		this.setState({ index: index }, this.props.onResize);
		this.props.onChange(index, 'mouse');
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
						{(this.state.index > 0) && <div className={styles.leftArrow} onClick={this.previous} />}
						{(this.state.index < this.props.children.length - 1) && <div className={styles.rightArrow} onClick={this.next} />}
					</div>
				}
				{this.props.children[this.state.index]}
			</div>
		);
	}
});
