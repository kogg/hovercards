var React = require('react');

var styles = require('./Images.styles');
var Image  = require('../Image/Image');

module.exports = React.createClass({
	displayName: 'Images',
	propTypes:   {
		images: React.PropTypes.array.isRequired,
		onLoad: React.PropTypes.func
	},
	getInitialState: function() {
		return { index: 0 };
	},
	previousImage: function() {
		this.setState({ index: Math.max(0, this.state.index - 1) });
	},
	nextImage: function() {
		this.setState({ index: Math.min(this.props.images.length - 1, this.state.index + 1) });
	},
	render: function() {
		if (this.props.images.length === 0) {
			return null;
		}
		if (this.props.images.length === 1) {
			return <Image image={this.props.images[0]} onLoad={this.props.onLoad} />;
		}
		return (
			<div className={styles.images}>
				<div className={styles.arrows}>
					{(this.state.index > 0) && <div className={styles.leftArrow} onClick={this.previousImage} />}
					{(this.state.index < this.props.images.length - 1) && <div className={styles.rightArrow} onClick={this.nextImage} />}
				</div>
				<Image image={this.props.images[this.state.index]} onLoad={this.props.onLoad} />
			</div>
		);
	}
});
