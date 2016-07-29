var React = require('react');

var styles = require('./Carousel.styles');

module.exports = React.createClass({
	displayName: 'Carousel',
	propTypes:   {
		children: React.PropTypes.arrayOf(React.PropTypes.node).isRequired,
		onResize: React.PropTypes.func
	},
	getInitialState: function() {
		return { index: 0 };
	},
	previous: function() {
		this.setState({ index: Math.max(0, this.state.index - 1) });
	},
	next: function() {
		this.setState({ index: Math.min(this.props.children.length - 1, this.state.index + 1) });
	},
	render: function() {
		if (this.props.children.length === 0) {
			return null;
		}
		return (
			<div className={styles.carousel}>
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
