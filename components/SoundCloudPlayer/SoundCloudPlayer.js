var _          = require('underscore');
var React      = require('react');
var classnames = require('classnames');
var errors     = require('feathers-errors');
var promisify  = require('es6-promisify');

var report = require('../../report');
var styles = require('./SoundCloudPlayer.styles');
var urls   = require('../../integrations/urls');

var SoundCloudPlayer = module.exports = React.createClass({
	displayName: 'SoundCloudPlayer',
	propTypes:   {
		className: React.PropTypes.string,
		content:   React.PropTypes.object.isRequired,
		image:     React.PropTypes.object,
		meta:      React.PropTypes.object.isRequired,
		muted:     React.PropTypes.bool.isRequired,
		onLoad:    React.PropTypes.func.isRequired
	},
	statics: {
		getSC: function() {
			if (window.SC) {
				report.catchException(new Error('window.SC should not exist'));
				return null;
			}
			SoundCloudPlayer.getSC = _.constant(
				fetch('https://w.soundcloud.com/player/api.js')
					.then(function(response) {
						if (!response.ok) {
							throw new errors.FeathersError('Youtube API won\'t load', 'FeathersError');
						}
						return response.text();
					})
					.then(function(text) {
						// HACK Eval-ing text we downloaded
						eval(text); // eslint-disable-line no-eval
						return window.SC;
					})
			);
			return SoundCloudPlayer.getSC();
		}
	},
	getInitialState: function() {
		return { player: null };
	},
	componentDidMount: function() {
		SoundCloudPlayer.getSC()
			.then(function(SC) {
				var player = SC.Widget(this.refs.player);
				player.bind(SC.Widget.Events.ERROR, report.catchException);
				if (this.props.meta.time_offset) {
					player.bind(SC.Widget.Events.PLAY, function() {
						player.seekTo(this.props.meta.time_offset * 1000);
					}.bind(this));
				}
				return promisify(player.bind.bind(player))(SC.Widget.Events.READY)
					.then(_.constant(player));
			}.bind(this))
			.then(function(player) {
				// HACK https://twitter.com/saiichihashi/status/763499483057393664
				player.play();
				this.setState({ player: player });
			}.bind(this))
			.catch(report.catchException);
	},
	componentDidUpdate: function() {
		if (!this.state || !this.state.player) {
			return;
		}
		this.state.player.setVolume(this.props.muted ? 0 : 1);
	},
	render: function() {
		// FIXME https://github.com/kogg/hovercards/issues/108
		return (
			<iframe className={classnames(styles.player, this.props.className)}
				ref="player"
				src={'https://w.soundcloud.com/player/?url=' + encodeURI(urls.print(this.props.content)) + '&autoplay=false&hide_related=true&show_user=true&show_reposts=false&visual=true'}
				style={{ backgroundImage: this.props.image && ('url(' + (this.props.image.medium || this.props.image.large || this.props.image.small) + ')') }}
				scrolling={false}
				frameBorder={false}
				onLoad={this.props.onLoad} />
		);
	}
});
