var _     = require('underscore');
var React = require('react');

var styles = require('./Gif.styles');

module.exports = React.createClass({
	displayName: 'Gif',
	propTypes:   {
		gif:    React.PropTypes.string.isRequired,
		image:  React.PropTypes.object.isRequired,
		onLoad: React.PropTypes.func
	},
	componentDidMount: function() {
		(this.props.onLoad || _.noop)();
	},
	render: function() {
		return (
			<video className={styles.gif}
				src={this.props.gif}
				poster={this.props.image.medium || this.props.image.large || this.props.image.small}
				muted={true}
				loop={true}
				autoPlay={true}
				onLoad={this.props.onLoad}
				onLoadStart={this.props.onLoad}
				onLoadedData={this.props.onLoad}
				onPlay={this.props.onLoad}
				ref="gif" />
		);
	}
});
