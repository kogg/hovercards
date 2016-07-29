var _         = require('underscore');
var React     = require('react');
var compose   = require('redux').compose;
var promisify = require('es6-promisify');

var styles = require('./YoutubeVideo.styles');

var YoutubeVideo = module.exports = React.createClass({
	displayName: 'YoutubeVideo',
	propTypes:   {
		content: React.PropTypes.object.isRequired,
		image:   React.PropTypes.object,
		muted:   React.PropTypes.bool.isRequired,
		onLoad:  React.PropTypes.func
	},
	statics: {
		getYT: function() {
			if (window.YT) {
				// FIXME #9 Log that this shouldn't be happening
				return null;
			}
			window.YT = window.YT || { loading: 0, loaded: 0 };
			window.YTConfig = window.YTConfig || { host: 'http://www.youtube.com' };
			if (window.YT.loading) {
				// FIXME #9 Log that this shouldn't be happening
				return null;
			}
			window.YT.loading = 1;
			var l = [];
			// Mostly copied from https://www.youtube.com/iframe_api
			/* eslint-disable */
			window.YT.ready = function(f) {if (window.YT.loaded) {f();} else {l.push(f);}};
			window.onYTReady = function() {window.YT.loaded = 1; for (var i = 0; i < l.length; i++) {try {l[i]();} catch (e) {}}};
			window.YT.setConfig = function(c) {for (var k in c) {if (c.hasOwnProperty(k)) {window.YTConfig[k] = c[k];}}};
			/* eslint-enable */
			YoutubeVideo.getYT = _.constant(
				Promise.all([
					// FIXME #9 Log youtube iframe loading errors
					// TODO Instead of hardcoding this url, retrieve it from https://www.youtube.com/iframe_api
					fetch('https://s.ytimg.com/yts/jsbin/www-widgetapi-vflwSZmGJ/www-widgetapi.js')
						.then(function(response) {
							return response.text();
						})
						.then(function(text) {
							/* eslint-disable no-eval */
							eval(text);
							/* eslint-enable no-eval */
						}),
					promisify(window.YT.ready.bind(window.YT))()
				])
					.then(function() {
						return window.YT;
					})
			);
			return YoutubeVideo.getYT();
		}
	},
	getInitialState: function() {
		return { player: null };
	},
	componentDidMount: function() {
		// FIXME This is causing a bug where the onLoad (which comes from Hovercard.js) doesn't have it's refs yet
		setTimeout(this.props.onLoad || _.noop);
		YoutubeVideo.getYT()
			.then(function(YT) {
				return new Promise(function(resolve, reject) {
					/* eslint-disable no-new */
					new YT.Player(this.refs.video, {
						events: {
							onReady: compose(resolve, _.property('target')),
							onError: reject
						}
					});
					/* eslint-enable no-new */
				}.bind(this));
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
			this.state.player.mute();
		} else {
			this.state.player.unMute();
		}
	},
	render: function() {
		return (
			<iframe className={styles.video}
				ref="video"
				src={'https://www.youtube.com/embed/' + this.props.content.id + '?enablejsapi=1&origin=' + document.origin + '&autoplay=1&mute=1&rel=0'}
				style={{ backgroundImage: this.props.image && ('url(' + (this.props.image.medium || this.props.image.large || this.props.image.small) + ')') }}
				allowFullScreen={true}
				onLoad={this.props.onLoad} />
		);
	}
});
