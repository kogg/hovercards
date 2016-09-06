var _              = require('underscore');
var Autolinker     = require('autolinker');
var errors         = require('feathers-errors');
var instagram_node = require('instagram-node');
var promisify      = require('es6-promisify');

var config = require('../config');
var urls   = require('../urls');
require('../mixins');

var DEFAULT_PROFILE_IMAGE = 'https://instagramimages-a.akamaihd.net/profiles/anonymousUser.jpg';

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

		return model.media_shortcode(_.pick(args, 'id'), _.pick(params, 'user'), usage)
			.then(function(media) {
				return _.pick(
					Object.assign(
						media_to_content(media, 'link'),
						{
							text:        Autolinker.link(_.chain(media).result('caption').result('text', '').value(), { mention: 'instagram', hashtag: 'instagram' }),
							account:     user_to_account(_.result(media, 'user')),
							discussions: [media_to_discussion(media)]
						}
					),
					_.somePredicate(_.isNumber, _.negate(_.isEmpty))
				);
			});
	};

	api.discussion = function(args) {
		var usage = { 'instagram-calls': 0 };

		return model.media_shortcode(_.pick(args, 'id'), _.pick(params, 'user'), usage)
			.then(media_to_discussion);
	};

	api.account = function(args) {
		var usage = { 'instagram-calls': 0 };

		var getUserIncomplete = model.user_search(_.pick(args, 'id'), _.pick(params, 'user'), usage)
			.then(function(users) {
				var user_incomplete = _.find(users, function(user) {
					return _.isEqual(user.username.toLowerCase(), _.result(args, 'id').toLowerCase());
				});
				if (!user_incomplete) {
					throw new errors.NotFound();
				}
				return user_incomplete;
			});

		return Promise.all([
			getUserIncomplete,
			getUserIncomplete
				.then(function(user_incomplete) {
					return model.user(_.pick(user_incomplete, 'id'), _.pick(params, 'user'), usage);
				}),
			getUserIncomplete
				.then(function(user_incomplete) {
					return model.user_media_recent(_.pick(user_incomplete, 'id'), _.pick(params, 'user'), usage)
						.catch(_.constant(null));
				})
		])
			.then(function(results) {
				var user        = Object.assign({}, results[0], results[1]);
				var user_counts = _.result(user, 'counts');

				var text = Autolinker.link(_.result(user, 'bio', ''), { mention: 'instagram', hashtag: 'instagram' });

				return _.pick(
					Object.assign(
						user_to_account(user),
						{
							text:  text,
							stats: {
								content:   Number(_.result(user_counts, 'media')),
								followers: Number(_.result(user_counts, 'followed_by')),
								following: Number(_.result(user_counts, 'follows'))
							},
							content: results[2] && {
								api:     'instagram',
								type:    'account_content',
								id:      _.result(user, 'username'),
								content: _.map(results[2], media_to_content)
							},
							accounts: _.chain(text.match(/href="[^"]+"/g))
								.invoke('slice', 6, -1)
								.map(urls.parse)
								.unshift(urls.parse(_.result(user, 'website')))
								.where({ type: 'account' })
								.value()
						}
					),
					_.somePredicate(_.isNumber, _.negate(_.isEmpty))
				);
			});
	};

	model.media_shortcode = function(args, args_not_cached, usage) {
		usage['instagram-calls']++;

		return promisify(instagram.media.bind(instagram.media))('shortcode/' + _.result(args, 'id'))
			.catch(catch_errors(args_not_cached));
	};

	model.user = function(args, args_not_cached, usage) {
		usage['instagram-calls']++;

		return promisify(instagram.user.bind(instagram.user))(_.result(args, 'id'))
			.catch(catch_errors(args_not_cached));
	};

	model.user_media_recent = function(args, args_not_cached, usage) {
		usage['instagram-calls']++;

		return promisify(instagram.user_media_recent.bind(instagram.user_media_recent))(_.result(args, 'id'), { count: config.counts.grid })
			.catch(catch_errors(args_not_cached));
	};

	model.user_search = function(args, args_not_cached, usage) {
		usage['instagram-calls']++;

		return promisify(instagram.user_search.bind(instagram.user_search))(_.result(args, 'id'), {})
			.catch(catch_errors(args_not_cached))
			.then(function(users) {
				if (_.isEmpty(users)) {
					throw new errors.NotFound();
				}
				return users;
			});
	};

	return api;

	function catch_errors(args_not_cached) {
		return function(err) {
			var status = err.status || err.code || err.status_code;

			switch (status) {
				case 404:
					throw new errors.NotFound(err);
				case 429:
					throw new errors.FeathersError(err, 'TooManyRequests', 429, 'too-many-requests');
				case 400:
					switch (err.error_type) {
						case 'APINotAllowedError':
							throw args_not_cached.user ?
								new errors.Forbidden(err) :
								new errors.NotAuthenticated(err);
						case 'APINotFoundError':
							throw new errors.NotFound(err);
						case 'OAuthAccessTokenException':
							throw new errors.NotAuthenticated(err);
						default:
							break;
					}
					/* falls through */
				default:
					if (err.message === 'Must be authentified') {
						throw new errors.NotAuthenticated(err);
					}
					err = status > 500 ?
						new errors.FeathersError(err, 'BadGateway', 502, 'bad-gateway') :
						new errors.GeneralError(err);
					err.original_code = status;
					throw err;
			}
		};
	}
};

function media_to_content(media) {
	var media_images = _.result(media, 'images');

	return !_.isEmpty(media) && _.pick(
		Object.assign(
			urls.parse(_.result(media, 'link')),
			{
				date:  _.result(media, 'created_time') * 1000,
				image: {
					small:  _.chain(media_images).result('thumbnail').result('url').value(),
					medium: _.chain(media_images).result('low_resolution').result('url').value(),
					large:  _.chain(media_images).result('standard_resolution').result('url').value()
				},
				video: (_.result(media, 'type') === 'video') && _.chain(media).result('videos').result('standard_resolution').result('url').value(),
				stats: {
					likes:    Number(_.chain(media).result('likes').result('count').value()),
					comments: Number(_.chain(media).result('comments').result('count').value())
				}
			}
		),
		_.somePredicate(_.isNumber, _.negate(_.isEmpty))
	);
}

function user_to_account(user) {
	return !_.isEmpty(user) && _.pick(
		{
			api:   'instagram',
			type:  'account',
			id:    _.result(user, 'username'),
			name:  _.result(user, 'full_name'),
			image: _.result(user, 'profile_picture') !== DEFAULT_PROFILE_IMAGE && { medium: _.result(user, 'profile_picture') }
		},
		_.negate(_.isEmpty)
	);
}

function media_to_discussion(media) {
	var media_comments = _.result(media, 'comments');

	return !_.isEmpty(media) && _.pick(
		Object.assign(
			urls.parse(_.result(media, 'link')),
			{
				type:     'discussion',
				comments: _.chain(media_comments)
					.result('data')
					.reject(_.isEmpty)
					.map(function(comment) {
						return _.pick(
							{
								api:     'instagram',
								type:    'comment',
								text:    Autolinker.link(_.result(comment, 'text'), { mention: 'instagram', hashtag: 'instagram' }),
								date:    _.result(comment, 'created_time') * 1000,
								account: user_to_account(_.result(comment, 'from'))
							},
							_.somePredicate(_.isNumber, _.negate(_.isEmpty))
						);
					})
					.value()
			}
		),
		_.somePredicate(_.isNumber, _.negate(_.isEmpty))
	);
}
