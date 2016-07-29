var React = require('react');

var Carousel = require('../Carousel/Carousel');
var Image    = require('../Image/Image');
var Gif      = require('../Gif/Gif');
var styles   = require('./Media.styles');

module.exports = React.createClass({
	displayName: 'Media',
	propTypes:   {
		content:  React.PropTypes.object.isRequired,
		onResize: React.PropTypes.func
	},
	render: function() {
		if (this.props.content.gif) {
			return (
				<div className={styles.media}>
					<Gif gif={this.props.content.gif} image={this.props.content.image} onLoad={this.props.onResize} />
				</div>
			);
		}
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
