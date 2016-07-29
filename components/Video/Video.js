var React      = require('react');
var classnames = require('classnames');

var styles = require('./Video.styles');

module.exports = React.createClass({
	displayName: 'Video',
	propTypes:   {
		className: React.PropTypes.string,
		image:     React.PropTypes.object,
		muted:     React.PropTypes.bool.isRequired,
		onLoad:    React.PropTypes.func.isRequired,
		video:     React.PropTypes.string.isRequired
	},
	getInitialState: function() {
		return { playing: true };
	},
	componentDidMount: function() {
		this.props.onLoad();
	},
	togglePlaying: function() {
		this.refs.video[this.state.playing ? 'pause' : 'play']();
		this.setState({ playing: !this.state.playing });
	},
	render: function() {
		return (
			<video className={classnames(styles.video, this.props.className)}
				ref="video"
				src={this.props.video}
				poster={this.props.image && (this.props.image.medium || this.props.image.large || this.props.image.small)}
				muted={this.props.muted}
				autoPlay={true}
				loop={true}
				controls={false}
				onClick={this.togglePlaying}
				onLoad={this.props.onLoad}
				onLoadStart={this.props.onLoad}
				onLoadedData={this.props.onLoad}
				onPlay={this.props.onLoad} />
		);
	}
});
