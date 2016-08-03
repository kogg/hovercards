var React      = require('react');
var classnames = require('classnames');

var styles = require('./Image.styles');

module.exports = React.createClass({
	displayName: 'Image',
	propTypes:   {
		className: React.PropTypes.string,
		image:     React.PropTypes.object.isRequired,
		onLoad:    React.PropTypes.func.isRequired
	},
	render: function() {
		return (
			<img className={classnames(styles.image, this.props.className)} src={this.props.image.large || this.props.image.medium || this.props.image.small}
				onLoad={this.props.onLoad} />
		);
	}
});
