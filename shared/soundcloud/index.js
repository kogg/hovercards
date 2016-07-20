var _          = require('underscore');
var Autolinker = require('autolinker');
var async      = require('async');
var config     = require('../config');
var request    = require('request');
var urls       = require('../urls');
require('../common/mixins');

module.exports = function(params) {
	var model = {};
	var api   = { model: model };

	function soundcloud(endpoint, args, callback) {
		request({ url:  'https://api.soundcloud.com' + endpoint, qs:   _.defaults({ client_id: params.key }, args), json: true },
			function(err, response) {
				if (err) {
					return callback(_.defaults(err, { status: 500 }));
				}
				if (_.result(response, 'statusCode') >= 400) {
					return callback({ status: response.statusCode });
				}
				callback(null, _.result(response, 'body'));
			});
	}

	var autolinker = new Autolinker({
		hashtag: 'twitter',
		replaceFn: function(autolinker, match) {
			switch (match.getType()) {
				case 'twitter':
					return autolinker.getTagBuilder().build(match).setAttr('href', urls.print({ api: 'soundcloud', type: 'account', id: match.getTwitterHandle() }));
				case 'hashtag':
					return autolinker.getTagBuilder().build(match).setAttr('href', 'https://soundcloud.com/tags/' + match.getHashtag());
			}
		}
	});

	function user_to_account(user) {
		var user_artwork_url = _.result(user, 'avatar_url', '');
		return !_.isEmpty(user) && _.pick({ api:   'soundcloud', type:  'account', id:    _.result(user, 'permalink'), name:  _.result(user, 'username'), image: !_.isEmpty(user_artwork_url) && !user_artwork_url.match(/default_avatar_large/) && { small:  user_artwork_url, medium: user_artwork_url.replace('-large', '-t300x300'), large:  user_artwork_url.replace('-large', '-t500x500') } }, _.negate(_.isEmpty));
	}

	function post_to_content(post) {
		var artwork_url = _.result(post, 'artwork_url', '');
		return !_.isEmpty(post) && _.pick({ api:     'soundcloud', type:    'content', id:      _.result(post, 'permalink'), as:      (_.result(post, 'kind') === 'playlist') && 'playlist', name:    _.result(post, 'title'), date:    Date.parse(_.result(post, 'created_at')), stats:   _.result(post, 'kind') === 'playlist' ? { content: Number(_.result(post, 'track_count')) } : { likes:    Number(_.result(post, 'favoritings_count')), views:    Number(_.result(post, 'playback_count')), comments: Number(_.result(post, 'comment_count')) }, image:   !artwork_url.match(/default_avatar_large/) && { small:  artwork_url, medium: artwork_url.replace('-large', '-t300x300'), large:  artwork_url.replace('-large', '-t500x500') }, account: user_to_account(post.user) }, _.somePredicate(_.isNumber, _.negate(_.isEmpty)));
	}

	api.content = function(args, callback) {
		var usage = {};
		model.resolve({ url: urls.print(_.defaults({ api: 'soundcloud', type: 'content' }, args)) }, null, usage, function(err, post) {
			if (err) {
				return callback(err, null, usage);
			}
			callback(null, _.chain(post_to_content(post)) .extend({ text:        autolinker.link((_.result(post, 'description') || '') .replace(/\n+$/, '') .replace(/\n/g, '<br>')), discussions: !_.result(post, 'commentable') && [{ api:           'soundcloud', type:          'discussion', id:            _.result(post, 'permalink'), uncommentable: true }] }) .pick(_.somePredicate(_.isNumber, _.negate(_.isEmpty))) .value(), usage);
		});
	};

	api.discussion = function(args, callback) {
		var usage = {};
		async.waterfall([
			function(callback) {
				model.resolve({ url: urls.print(_.defaults({ api: 'soundcloud', type: 'content', as: 'track' }, args)) }, null, usage, callback);
			},
			function(track, callback) {
				model.tracks_comments(_.pick(track, 'id'), null, usage, callback);
			}
		], function(err, comments) {
			if (err) {
				return callback(err, null, usage);
			}
			callback(null, _.pick({ api:      'soundcloud', type:     'discussion', id:       args.id, comments: _.chain(comments) .first(config.counts.listed) .map(function(comment) {
			                                       	return _.pick({ api:         'soundcloud', type:        'comment', id:          _.result(comment, 'id'), text:        autolinker.link((_.result(comment, 'body') || '') .replace(/\n+$/, '') .replace(/\n/g, '<br>')), date:        Date.parse(_.result(comment, 'created_at')), time_offset: Number(_.result(comment, 'timestamp')), account:     user_to_account(_.result(comment, 'user')) }, _.somePredicate(_.isNumber, _.negate(_.isEmpty))); }) .reject(_.isEmpty) .value() }, _.negate(_.isEmpty)), usage);
		});
	};

	api.account = function(args, callback) {
		var usage = {};
		async.auto({
			user: function(callback) {
				model.resolve({ url: urls.print(_.defaults({ api: 'soundcloud', type: 'account' }, args)) }, null, usage, callback);
			},
			web_profiles: ['user', function(callback, results) {
				model.users_web_profiles(_.pick(results.user, 'id'), null, usage, function(err, web_profiles) {
					callback(null, web_profiles || []);
				});
			}]
		}, function(err, results) {
			if (err) {
				return callback(err, null, usage);
			}

			var text = autolinker.link((_.result(results.user, 'description') || '') .replace(/\n+$/, '') .replace(/\n/g, '<br>'));

			callback(null, _.chain(user_to_account(results.user)) .extend({ text:     text, stats:    { content:   Number(_.result(results.user, 'track_count')), followers: Number(_.result(results.user, 'followers_count')), following: Number(_.result(results.user, 'followings_count')) }, accounts: _.chain(results.web_profiles) .pluck('url') .union([_.result(results.user, 'website')]) .union(_.invoke(text.match(/href="[^"]+"/g), 'slice', 6, -1)) .map(urls.parse) .where({ type: 'account' }) .uniq(false, function(account) { return _.compact([account.api, account.id, account.as]).join('/'); }) .value() }) .pick(_.somePredicate(_.isNumber, _.negate(_.isEmpty))) .value(), usage);
		});
	};

	api.account_content = function(args, callback) {
		var usage = {};
		async.auto({
			user: function(callback) {
				model.resolve({ url: urls.print(_.defaults({ api: 'soundcloud', type: 'account' }, args)) }, null, usage, callback);
			},
			user_playlists: ['user', function(callback, results) {
				model.users_playlists(_.pick(results.user, 'id'), null, usage, callback);
			}],
			user_tracks: ['user', function(callback, results) {
				model.users_tracks(_.pick(results.user, 'id'), null, usage, callback);
			}]
		}, function(err, results) {
			if (err) {
				return callback(err, null, usage);
			}
			callback(null, _.pick({ api:     'soundcloud', type:    'account_content', id:      args.id, content: _.chain(results.user_tracks) .union(results.user_playlists) .sortBy(function(post) { return -Date.parse(post.created_at); }) .first(config.counts.grid) .map(post_to_content) .each(function(content) {
			                                      	_.extend(content, _.isEmpty(content.account) && { account: _.pick(content.account, 'api', 'type', 'id') }); }) .reject(_.isEmpty) .value() }, _.negate(_.isEmpty)), usage);
		});
	};

	function callback_err_to_my_err(err, response, callback) {
		if (err) {
			switch (err.status) {
				case 401:
					err.status = 403;
					/* falls through */
				case 403:
				case 404:
				case 429:
					break;
				default:
					err.original_status = err.status;
					err.status = (err.status >= 500) ? 502 : 500;
					break;
			}
			return callback(err);
		}
		callback(null, response);
	}

	model.resolve = function(args, args_not_cached, usage, callback) {
		callback = _.wrapErrorCallback(callback, 'SoundCloud Resolve');

		soundcloud('/resolve', { url: _.result(args, 'url') }, _.partial(callback_err_to_my_err, _, _, callback));
	};

	model.tracks_comments = function(args, args_not_cached, usage, callback) {
		callback = _.wrapErrorCallback(callback, 'SoundCloud Tracks Comments');

		soundcloud('/tracks/' + _.result(args, 'id') + '/comments', null, _.partial(callback_err_to_my_err, _, _, callback));
	};

	model.users_playlists = function(args, args_not_cached, usage, callback) {
		callback = _.wrapErrorCallback(callback, 'SoundCloud Users Playlists');

		soundcloud('/users/' + _.result(args, 'id') + '/playlists', { representation: 'compact' }, _.partial(callback_err_to_my_err, _, _, callback));
	};

	model.users_tracks = function(args, args_not_cached, usage, callback) {
		callback = _.wrapErrorCallback(callback, 'SoundCloud Users Tracks');

		soundcloud('/users/' + _.result(args, 'id') + '/tracks', null, _.partial(callback_err_to_my_err, _, _, callback));
	};

	model.users_web_profiles = function(args, args_not_cached, usage, callback) {
		callback = _.wrapErrorCallback(callback, 'SoundCloud Users Web Profiles');

		soundcloud('/users/' + _.result(args, 'id') + '/web-profiles', null, _.partial(callback_err_to_my_err, _, _, callback));
	};

	return api;
};
