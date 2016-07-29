var React      = require('react');
var classnames = require('classnames');

var styles = require('./Gif.styles');

module.exports = React.createClass({
	displayName: 'Gif',
	propTypes:   {
		className: React.PropTypes.string,
		gif:       React.PropTypes.string.isRequired,
		image:     React.PropTypes.object,
		onLoad:    React.PropTypes.func.isRequired
	},
	componentDidMount: function() {
		this.props.onLoad();
	},
	render: function() {
		return (
			<video className={classnames(styles.gif, this.props.className)}
				src={this.props.gif}
				poster={this.props.image && (this.props.image.medium || this.props.image.large || this.props.image.small)}
				muted={true}
				autoPlay={true}
				loop={true}
				controls={false}
				onLoad={this.props.onLoad}
				onLoadStart={this.props.onLoad}
				onLoadedData={this.props.onLoad}
				onPlay={this.props.onLoad} />
		);
	}
});
