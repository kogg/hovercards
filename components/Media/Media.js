var React = require('react');

var Carousel = require('../Carousel/Carousel');
var Image    = require('../Image/Image');
var styles   = require('./Media.styles');

module.exports = React.createClass({
	displayName: 'Media',
	propTypes:   {
		content:  React.PropTypes.object.isRequired,
		onResize: React.PropTypes.func
	},
	render: function() {
		if (this.props.content.images) {
			return (
				<div className={styles.media}>
					<Carousel onLoad={this.props.onResize}>
						{this.props.content.images.map(function(image, i) {
							return <Image key={i} image={image} onLoad={this.props.onResize} />;
						}.bind(this))}
					</Carousel>
				</div>
			);
		}
		if (this.props.content.image) {
			return (
				<div className={styles.media}>
					<Image image={this.props.content.image} onLoad={this.props.onResize} />
				</div>
			);
		}
		return null;
	}
});
