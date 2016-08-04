var _              = require('underscore');
var Autolinker     = require('autolinker');
var instagram_node = require('instagram-node');
var promisify      = require('es6-promisify');

var config = require('../config');
var urls   = require('../urls');
require('../mixins');

var DEFAULT_PROFILE_IMAGE = 'https://instagramimages-a.akamaihd.net/profiles/anonymousUser.jpg';

var autolinker = new Autolinker({
	hashtag:   'instagram',
	replaceFn: function(autolinker, match) {
		if (match.getType() !== 'twitter') {
			return null;
		}
		return autolinker.getTagBuilder().build(match).setAttr('href', urls.print({ api: 'instagram', type: 'account', id: match.getTwitterHandle() }));
	}
});

module.exports = function(params) {
	var instagram = instagram_node.instagram();
	var model     = {};
	var api       = { model: model };

	if ((params.key || process.env.INSTAGRAM_CLIENT_ID) && (params.secret || process.env.INSTAGRAM_CLIENT_SECRET)) {
		instagram.use({ client_id: params.key || process.env.INSTAGRAM_CLIENT_ID, client_secret: params.secret || process.env.INSTAGRAM_CLIENT_SECRET });
	} else if (params.user) {
		instagram.use({ access_token: params.user });
	}

	api.content = function(args) {
		var usage = { 'instagram-calls': 0 };

		return model.media_shortcode(_.pick(args, 'id'), null, usage)
			.then(function(media) {
				return _.chain(media_to_content(media, 'link')).extend({ text: autolinker.link(_.chain(media).result('caption').result('text', '').value()), account: user_to_account(_.result(media, 'user')), discussions: [media_to_discussion(media)] }).pick(_.somePredicate(_.isNumber, _.negate(_.isEmpty))).value();
			});
	};

	api.discussion = function(args) {
		var usage = { 'instagram-calls': 0 };

		return model.media_shortcode(_.pick(args, 'id'), null, usage)
			.then(media_to_discussion);
	};

	api.account = function(args) {
		var usage = { 'instagram-calls': 0 };

		var getUserIncomplete = model.user_search(_.pick(args, 'id'), null, usage)
			.then(function(users) {
				var user_incomplete = _.find(users, function(user) { return _.isEqual(user.username.toLowerCase(), _.result(args, 'id').toLowerCase()); });
				if (!user_incomplete) {
					return Promise.reject({ message: 'Instagram User Search', status: 404 });
				}
				return user_incomplete;
			});

		return Promise.all([
			getUserIncomplete,
			getUserIncomplete
				.then(function(user_incomplete) {
					return model.user(_.pick(user_incomplete, 'id'), null, usage);
				}),
			getUserIncomplete
				.then(function(user_incomplete) {
					return model.user_media_recent(_.pick(user_incomplete, 'id'), null, usage).catch(function() {
						return null;
					});
				})
		])
			.then(function(results) {
				var user        = _.extend({}, results[0], results[1]);
				var user_counts = _.result(user, 'counts');

				var text = autolinker.link(_.result(user, 'bio', ''));

				return _.chain(user_to_account(user)).extend({ text: text, stats: { content: Number(_.result(user_counts, 'media')), followers: Number(_.result(user_counts, 'followed_by')), following: Number(_.result(user_counts, 'follows')) }, accounts: _.chain(text.match(/href="[^"]+"/g)).invoke('slice', 6, -1).map(urls.parse).unshift(urls.parse(_.result(user, 'website'))).where({ type: 'account' }).value(), content: results[2] && { api: 'instagram', type: 'account_content', id: _.result(user, 'username'), content: _.map(results[2], media_to_content) } }).pick(_.somePredicate(_.isNumber, _.negate(_.isEmpty))).value();
			});
	};

	api.account_content = function(args) {
		var usage = { 'instagram-calls': 0 };

		var getUserIncomplete = model.user_search(_.pick(args, 'id'), null, usage)
			.then(function(users) {
				var user_incomplete = _.find(users, function(user) { return _.isEqual(user.username.toLowerCase(), _.result(args, 'id').toLowerCase()); });
				if (!user_incomplete) {
					return Promise.reject({ message: 'Instagram User Search', status: 404 });
				}
				return user_incomplete;
			});

		return Promise.all([
			getUserIncomplete,
			getUserIncomplete
				.then(function(user_incomplete) {
					return model.user_media_recent(_.pick(user_incomplete, 'id'), null, usage);
				})
		])
			.then(function(results) {
				return _.pick({ api: 'instagram', type: 'account_content', id: _.result(results[0], 'username') || args.id, content: _.chain(results[1]).map(media_to_content).reject(_.isEmpty).value() }, _.negate(_.isEmpty));
			});
	};

	model.media_shortcode = function(args, args_not_cached, usage) {
		usage['instagram-calls']++;

		return promisify(instagram.media.bind(instagram.media))('shortcode/' + _.result(args, 'id')).catch(catch_errors('Instagram Media Shortcode'));
	};

	model.user = function(args, args_not_cached, usage) {
		usage['instagram-calls']++;

		return promisify(instagram.user.bind(instagram.user))(_.result(args, 'id')).catch(catch_errors('Instagram User'));
	};

	model.user_media_recent = function(args, args_not_cached, usage) {
		usage['instagram-calls']++;

		return promisify(instagram.user_media_recent.bind(instagram.user_media_recent))(_.result(args, 'id'), { count: config.counts.grid }).catch(catch_errors('Instagram User Media Recent'));
	};

	model.user_search = function(args, args_not_cached, usage) {
		usage['instagram-calls']++;

		return promisify(instagram.user_search.bind(instagram.user_search))(_.result(args, 'id'), {})
			.then(function(users) {
				if (_.isEmpty(users)) {
					return Promise.reject({ status: 404, message: '' });
				}
				return users;
			})
			.catch(function(err) {
				var status = err.status || err.code || err.status_code;
				var error_type = err.error_type;
				err.message = 'Instagram User Search - ' + String(err.message);
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
						if (err.message === 'Instagram User Search - Must be authentified') {
							err.status = 401;
						} else {
							err.status = (status >= 500) ? 502 : 500;
							err.original_status = status;
						}
						break;
				}
				return Promise.reject(err);
			});
	};

	return api;

	function catch_errors(errName) {
		return function(err) {
			var status     = err.status || err.code || err.status_code;
			var error_type = err.error_type;
			err.message = errName + ' - ' + String(err.message);
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
					if (err.message === errName + ' - Must be authentified') {
						err.status = 401;
					} else {
						err.status = (status >= 500) ? 502 : 500;
						err.original_status = status;
					}
					break;
			}
			return Promise.reject(err);
		};
	}
};

function media_to_content(media) {
	var media_images = _.result(media, 'images');
	return !_.isEmpty(media) && _.chain(urls.parse(_.result(media, 'link')))
		.extend({
			date:  _.result(media, 'created_time') * 1000,
			image: { small: _.chain(media_images).result('thumbnail').result('url').value(), medium: _.chain(media_images).result('low_resolution').result('url').value(), large: _.chain(media_images).result('standard_resolution').result('url').value() },
			video: (_.result(media, 'type') === 'video') && _.chain(media).result('videos').result('standard_resolution').result('url').value(),
			stats: { likes: Number(_.chain(media).result('likes').result('count').value()), comments: Number(_.chain(media).result('comments').result('count').value()) }
		})
		.pick(_.somePredicate(_.isNumber, _.negate(_.isEmpty)))
		.value();
}

function user_to_account(user) {
	return !_.isEmpty(user) && _.pick({ api: 'instagram', type: 'account', id: _.result(user, 'username'), name: _.result(user, 'full_name'), image: _.result(user, 'profile_picture') !== DEFAULT_PROFILE_IMAGE && { medium: _.result(user, 'profile_picture') } }, _.negate(_.isEmpty));
}

function media_to_discussion(media) {
	var media_comments = _.result(media, 'comments');
	return !_.isEmpty(media) && _.chain(urls.parse(_.result(media, 'link'))).extend({ type:     'discussion', comments: _.chain(media_comments).result('data').reject(_.isEmpty).map(function(comment) {
		return _.pick({ api: 'instagram', type: 'comment', text: autolinker.link(_.result(comment, 'text')), date: _.result(comment, 'created_time') * 1000, account: user_to_account(_.result(comment, 'from')) }, _.somePredicate(_.isNumber, _.negate(_.isEmpty))); }).value() }).pick(_.somePredicate(_.isNumber, _.negate(_.isEmpty))).value();
}
