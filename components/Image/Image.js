var React = require('react');

var styles = require('./Image.styles');

module.exports = React.createClass({
	displayName: 'Image',
	propTypes:   {
		image:  React.PropTypes.object.isRequired,
		onLoad: React.PropTypes.func
	},
	componentDidMount: function() {
		this.props.onLoad();
	},
	render: function() {
		return <img className={styles.image} src={this.props.image.large || this.props.image.medium || this.props.image.small} onLoad={this.props.onLoad} />;
	}
});
