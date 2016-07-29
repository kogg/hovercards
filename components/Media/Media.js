var React = require('react');

var Image  = require('../Image/Image');
var Images = require('../Images/Images');
var styles = require('./Media.styles');

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
					<Images images={this.props.content.images} onLoad={this.props.onResize} />
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
