var _         = require('underscore');
var React     = require('react');
var promisify = require('es6-promisify');

var styles = require('./SoundCloudPlayer.styles');
var urls   = require('../../integrations/urls');

var SoundCloudPlayer = module.exports = React.createClass({
	displayName: 'SoundCloudPlayer',
	propTypes:   {
		content: React.PropTypes.object.isRequired,
		image:   React.PropTypes.object,
		muted:   React.PropTypes.bool.isRequired,
		onLoad:  React.PropTypes.func
	},
	statics: {
		getSC: function() {
			if (window.SC) {
				// FIXME #9 Log that this shouldn't be happening
				return null;
			}
			SoundCloudPlayer.getSC = _.constant(
				// FIXME #9 Log soundcloud iframe loading errors
				fetch('https://w.soundcloud.com/player/api.js')
					.then(function(response) {
						return response.text();
					})
					.then(function(text) {
						/* eslint-disable no-eval */
						eval(text);
						/* eslint-enable no-eval */
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
		setTimeout(this.props.onLoad || _.noop); // FIXME Why does this need a setTimeout?
		SoundCloudPlayer.getSC()
			.then(function(SC) {
				var player = SC.Widget(this.refs.player);
				return promisify(player.bind.bind(player))(SC.Widget.Events.READY).then(_.constant(player));
			}.bind(this))
			.then(function(player) {
				this.setState({ player: player });
			}.bind(this));
	},
	componentDidUpdate: function() {
		if (!this.state || !this.state.player) {
			return;
		}
		if (this.props.muted) {
			this.state.player.setVolume(0);
		} else {
			this.state.player.setVolume(1);
		}
	},
	render: function() {
		// FIXME Won't play https://soundcloud.com/majorlazer/sets/peace-is-the-mission ?
		return (
			<iframe className={styles.player}
				ref="player"
				src={'https://w.soundcloud.com/player/?url=' + encodeURI(urls.print(this.props.content)) + '&auto_play=true&hide_related=true&show_user=true&show_reposts=false&visual=true'}
				style={{ backgroundImage: this.props.image && ('url(' + (this.props.image.medium || this.props.image.large || this.props.image.small) + ')') }}
				scrolling={false}
				frameBorder={false}
				onLoad={this.props.onLoad} />
		);
	}
});
