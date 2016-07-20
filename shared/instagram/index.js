var _              = require('underscore');
var Autolinker     = require('autolinker');
var async          = require('async');
var config         = require('../config');
var instagram_node = require('instagram-node');
var urls           = require('../urls');
require('../common/mixins');

var DEFAULT_PROFILE_IMAGE = 'https://instagramimages-a.akamaihd.net/profiles/anonymousUser.jpg';

module.exports = function(params) {
	var instagram = instagram_node.instagram();
	var model   = {};
	var api     = { model: model };

	if (params.key && params.secret) {
		instagram.use({ client_id: params.key, client_secret: params.secret });
	} else if (params.user) {
		instagram.use({ access_token: params.user });
	}

	var autolinker = new Autolinker({
		hashtag: 'instagram',
		replaceFn: function(autolinker, match) {
			if (match.getType() !== 'twitter') {
				return;
			}
			return autolinker.getTagBuilder().build(match).setAttr('href', urls.print({ api: 'instagram', type: 'account', id: match.getTwitterHandle() }));
		}
	});

	function media_to_content(media) {
		var media_images = _.result(media, 'images');
		return !_.isEmpty(media) && _.chain(urls.parse(_.result(media, 'link'))) .extend({ date:  _.result(media, 'created_time') * 1000, image: { small:  _.chain(media_images).result('thumbnail').result('url').value(), medium: _.chain(media_images).result('low_resolution').result('url').value(), large:  _.chain(media_images).result('standard_resolution').result('url').value() }, video: (_.result(media, 'type') === 'video') && _.chain(media).result('videos').result('standard_resolution').result('url').value(), stats: { likes:    Number(_.chain(media).result('likes').result('count').value()), comments: Number(_.chain(media).result('comments').result('count').value()) } }) .pick(_.somePredicate(_.isNumber, _.negate(_.isEmpty))) .value();
	}

	function user_to_account(user) {
		return !_.isEmpty(user) && _.pick({ api:   'instagram', type:  'account', id:    _.result(user, 'username'), name:  _.result(user, 'full_name'), image: _.result(user, 'profile_picture') !== DEFAULT_PROFILE_IMAGE && { medium: _.result(user, 'profile_picture') } }, _.negate(_.isEmpty));
	}

	function media_to_discussion(media) {
		var media_comments = _.result(media, 'comments');
		return !_.isEmpty(media) && _.chain(urls.parse(_.result(media, 'link'))) .extend({ type:     'discussion', comments: _.chain(media_comments) .result('data') .reject(_.isEmpty) .map(function(comment) {
		                                                      	return _.pick({ api:     'instagram', type:    'comment', text:    autolinker.link(_.result(comment, 'text')), date:    _.result(comment, 'created_time') * 1000, account: user_to_account(_.result(comment, 'from')) }, _.somePredicate(_.isNumber, _.negate(_.isEmpty))); }) .value() }) .pick(_.somePredicate(_.isNumber, _.negate(_.isEmpty))) .value();
	}

	api.content = function(args, callback) {
		var usage = { 'instagram-calls': 0 };
		model.media_shortcode(_.pick(args, 'id'), null, usage, function(err, media) {
			if (err) {
				return callback(err, null, usage);
			}

			callback(null, _.chain(media_to_content(media, 'link')) .extend({ text:        autolinker.link(_.chain(media) .result('caption') .result('text', '') .value()), account:     user_to_account(_.result(media, 'user')), discussions: [media_to_discussion(media)] }) .pick(_.somePredicate(_.isNumber, _.negate(_.isEmpty))) .value(), usage);
		});
	};

	api.discussion = function(args, callback) {
		var usage = { 'instagram-calls': 0 };
		model.media_shortcode(_.pick(args, 'id'), null, usage, function(err, media) {
			if (err) {
				return callback(err, null, usage);
			}

			callback(null, media_to_discussion(media), usage);
		});
	};

	api.account = function(args, callback) {
		var usage = { 'instagram-calls': 0 };
		async.auto({
			user_incomplete: function(callback) {
				model.user_search(_.pick(args, 'id'), null, usage, function(err, users) {
					if (err) {
						return callback(err);
					}
					var user_incomplete = _.find(users, function(user) { return _.isEqual(user.username.toLowerCase(), _.result(args, 'id').toLowerCase()); });
					if (!user_incomplete) {
						return callback({ message: 'Instagram User Search', status: 404 });
					}
					callback(null, user_incomplete);
				});
			},
			user: ['user_incomplete', function(callback, results) {
				model.user(_.pick(results.user_incomplete, 'id'), null, usage, callback);
			}],
			user_media_recent: ['user_incomplete', function(callback, results) {
				model.user_media_recent(_.pick(results.user_incomplete, 'id'), null, usage, function(err, media) {
					callback(null, media);
				});
			}]
		}, function(err, results) {
			if (err) {
				return callback(err, null, usage);
			}

			var user        = _.extend({}, results.user_incomplete, results.user);
			var user_counts = _.result(user, 'counts');

			var text = autolinker.link(_.result(user, 'bio', ''));

			callback(null, _.chain(user_to_account(user)) .extend({ text:     text, stats:    { content:   Number(_.result(user_counts, 'media')), followers: Number(_.result(user_counts, 'followed_by')), following: Number(_.result(user_counts, 'follows')) }, accounts: _.chain(text.match(/href="[^"]+"/g)) .invoke('slice', 6, -1) .map(urls.parse) .unshift(urls.parse(_.result(user, 'website'))) .where({ type: 'account' }) .value(), content:  results.user_media_recent && { api:     'instagram', type:    'account_content', id:      _.result(user, 'username'), content: _.map(results.user_media_recent, media_to_content) } }) .pick(_.somePredicate(_.isNumber, _.negate(_.isEmpty))) .value(), usage);
		});
	};

	api.account_content = function(args, callback) {
		var usage = { 'instagram-calls': 0 };
		async.auto({
			user_incomplete: function(callback) {
				model.user_search(_.pick(args, 'id'), null, usage, function(err, users) {
					if (err) {
						return callback(err);
					}
					var user_incomplete = _.find(users, function(user) { return _.isEqual(user.username.toLowerCase(), _.result(args, 'id').toLowerCase()); });
					if (!user_incomplete) {
						return callback({ message: 'Instagram User Search', status: 404 });
					}
					callback(null, user_incomplete);
				});
			},
			user_media_recent: ['user_incomplete', function(callback, results) {
				model.user_media_recent(_.pick(results.user_incomplete, 'id'), null, usage, callback);
			}]
		}, function(err, results) {
			if (err) {
				return callback(err, null, usage);
			}

			callback(null, _.pick({ api:     'instagram', type:    'account_content', id:      _.result(results.user_incomplete, 'username') || args.id, content: _.chain(results.user_media_recent) .map(media_to_content) .reject(_.isEmpty) .value() }, _.negate(_.isEmpty)), usage);
		});
	};

	function callback_err_to_my_err(err, response, callback) {
		if (err) {
			var status     = err.status || err.code || err.status_code;
			var error_type = err.error_type;
			err = err ? { message: err.message } : {};
			switch (status) {
				case 404:
				case 429:
					err.status = status;
					break;
				case 400:
					switch (error_type) {
						case 'APINotAllowedError':
							err.status = params.user ? 403 : 401;
							break;
						case 'APINotFoundError':
							err.status = 404;
							break;
						case 'OAuthAccessTokenException':
							err.status = 401;
							break;
						default:
							err.status = (status >= 500) ? 502 : 500;
							err.original_status = status;
							break;
					}
					break;
				default:
					err.status = (status >= 500) ? 502 : 500;
					err.original_status = status;
					break;
			}
			return callback(err);
		}
		callback(null, response);
	}

	model.media_shortcode = function(args, args_not_cached, usage, callback) {
		callback = _.wrapErrorCallback(callback, 'Instagram Media Shortcode');

		usage['instagram-calls']++;
		instagram.media('shortcode/' + _.result(args, 'id'), _.partial(callback_err_to_my_err, _, _, callback));
	};

	model.user = function(args, args_not_cached, usage, callback) {
		callback = _.wrapErrorCallback(callback, 'Instagram User');

		usage['instagram-calls']++;
		instagram.user(_.result(args, 'id'), _.partial(callback_err_to_my_err, _, _, callback));
	};

	model.user_media_recent = function(args, args_not_cached, usage, callback) {
		callback = _.wrapErrorCallback(callback, 'Instagram User Media Recent');

		usage['instagram-calls']++;
		instagram.user_media_recent(_.result(args, 'id'), { count: config.counts.grid }, _.partial(callback_err_to_my_err, _, _, callback));
	};

	model.user_search = function(args, args_not_cached, usage, callback) {
		callback = _.wrapErrorCallback(callback, 'Instagram User Search');

		usage['instagram-calls']++;
		instagram.user_search(_.result(args, 'id'), {}, function(err, users) {
			if (err) {
				var status = err.status || err.code || err.status_code;
				var error_type = err.error_type;
				err = err ? { message: err.message } : {};
				switch (status) {
					case 404:
					case 429:
						err.status = status;
						break;
					case 400:
						switch (error_type) {
							case 'OAuthAccessTokenException':
								err.status = 401;
								break;
							default:
								err.status = (status >= 500) ? 502 : 500;
								err.original_status = status;
								break;
						}
						break;
					default:
						err.status = (status >= 500) ? 502 : 500;
						err.original_status = status;
						break;
				}
				return callback(err);
			}
			if (_.isEmpty(users)) {
				return callback({ status: 404 });
			}
			callback(null, users);
		});
	};

	return api;
};
