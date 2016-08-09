var _          = require('underscore');
var React      = require('react');
var classnames = require('classnames');
var compose    = require('redux').compose;
var promisify  = require('es6-promisify');

var report = require('../../report');
var styles = require('./YoutubeVideo.styles');

var YoutubeVideo = module.exports = React.createClass({
	displayName: 'YoutubeVideo',
	propTypes:   {
		className: React.PropTypes.string,
		content:   React.PropTypes.object.isRequired,
		image:     React.PropTypes.object,
		meta:      React.PropTypes.object.isRequired,
		muted:     React.PropTypes.bool.isRequired,
		onLoad:    React.PropTypes.func.isRequired
	},
	statics: {
		getYT: function() {
			if (window.YT) {
				report.error(new Error('window.YT should not exist'));
				return null;
			}
			window.YT = window.YT || { loading: 0, loaded: 0 };
			window.YTConfig = window.YTConfig || { host: 'http://www.youtube.com' };
			if (window.YT.loading) {
				report.error(new Error('window.YT.loading should not exist'));
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
					// TODO Instead of hardcoding this url, retrieve it from https://www.youtube.com/iframe_api
					fetch('https://s.ytimg.com/yts/jsbin/www-widgetapi-vflwSZmGJ/www-widgetapi.js')
						.then(function(response) {
							return response.text();
						})
						.then(function(text) {
							eval(text); // eslint-disable-line no-eval
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
			}.bind(this))
			.catch(report.error);
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
			<iframe className={classnames(styles.video, this.props.className)}
				ref="video"
				src={'https://www.youtube.com/embed/' + this.props.content.id + '?enablejsapi=1&origin=' + document.origin + '&autoplay=1&mute=1&rel=0' + (this.props.meta.time_offset ? '&start=' + this.props.meta.time_offset : '')}
				style={{ backgroundImage: this.props.image && ('url(' + (this.props.image.medium || this.props.image.large || this.props.image.small) + ')') }}
				allowFullScreen={true}
				onLoad={this.props.onLoad} />
		);
	}
});
