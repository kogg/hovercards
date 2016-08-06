var _           = require('underscore');
var Autolinker  = require('autolinker');
var errors      = require('feathers-errors');
var querystring = require('querystring');

var config = require('../config');
var urls   = require('../urls');
require('../mixins');

/*
 * FIXME We can now follow redirects how we want https://developer.mozilla.org/en-US/docs/Web/API/GlobalFetch/fetch
 * So a lot of this is weird because CLIENT SIDE WE CAN'T STOP THE REDIRECTS FROM HAPPENING
 * So even for for comments, for example, we have to go grab the track.
 */

module.exports = function(params) {
	var model = {};
	var api   = { model: model };

	var autolinker = new Autolinker({
		hashtag:   'twitter',
		replaceFn: function(autolinker, match) {
			switch (match.getType()) {
				case 'twitter':
					return autolinker.getTagBuilder().build(match).setAttr('href', urls.print({ api: 'soundcloud', type: 'account', id: match.getTwitterHandle() }));
				case 'hashtag':
					return autolinker.getTagBuilder().build(match).setAttr('href', 'https://soundcloud.com/tags/' + match.getHashtag());
				default:
					return null;
			}
		}
	});

	api.content = function(args) {
		var usage = {};

		return model.resolve({ url: urls.print(_.defaults({ api: 'soundcloud', type: 'content' }, args)) }, null, usage)
			.then(function(post) {
				return _.chain(post_to_content(post))
					.extend({
						text: autolinker.link((_.result(post, 'description') || '')
							.replace(/\n+$/, '')
							.replace(/\n/g, '<br>')),
						discussions: !_.result(post, 'commentable') && [{
							api:           'soundcloud',
							type:          'discussion',
							id:            _.result(post, 'permalink'),
							uncommentable: true
						}]
					})
					.pick(_.somePredicate(_.isNumber, _.negate(_.isEmpty)))
					.value();
			});
	};

	api.discussion = function(args) {
		var usage = {};

		return model.resolve({ url: urls.print(_.defaults({ api: 'soundcloud', type: 'content', as: 'track' }, args)) }, null, usage)
			.then(function(track) {
				return model.tracks_comments(_.pick(track, 'id'), null, usage);
			})
			.then(function(comments) {
				return _.pick(
					{
						api:      'soundcloud',
						type:     'discussion',
						id:       args.id,
						comments: _.chain(comments)
							.first(config.counts.listed)
							.map(function(comment) {
								return _.pick(
									{
										api:  'soundcloud',
										type: 'comment',
										id:   _.result(comment, 'id'),
										text: autolinker.link((_.result(comment, 'body') || '')
											.replace(/\n+$/, '')
											.replace(/\n/g, '<br>')),
										date:        Date.parse(_.result(comment, 'created_at')),
										time_offset: Number(_.result(comment, 'timestamp')),
										account:     user_to_account(_.result(comment, 'user'))
									},
									_.somePredicate(_.isNumber, _.negate(_.isEmpty))
								);
							})
							.reject(_.isEmpty)
							.value()
					},
					_.negate(_.isEmpty)
				);
			});
	};

	api.account = function(args) {
		var usage = {};

		var getUser = model.resolve({ url: urls.print(_.defaults({ api: 'soundcloud', type: 'account' }, args)) }, null, usage);

		return Promise.all([
			getUser,
			getUser
				.then(function(user) {
					return model.users_web_profiles(_.pick(user, 'id'), null, usage);
				})
				.catch(_.constant([]))
		])
			.then(function(results) {
				var text = autolinker.link((_.result(results[0], 'description') || '').replace(/\n+$/, '').replace(/\n/g, '<br>'));

				return _.chain(user_to_account(results[0]))
					.extend({
						text:  text,
						stats: {
							content:   Number(_.result(results[0], 'track_count')),
							followers: Number(_.result(results[0], 'followers_count')),
							following: Number(_.result(results[0], 'followings_count'))
						},
						accounts: _.chain(results[1])
							.pluck('url')
							.union([_.result(results[0], 'website')])
							.union(_.invoke(text.match(/href="[^"]+"/g), 'slice', 6, -1))
							.map(urls.parse)
							.where({ type: 'account' })
							.uniq(false, function(account) {
								return _.compact([account.api, account.id, account.as]).join('/');
							})
							.value()
					})
					.pick(_.somePredicate(_.isNumber, _.negate(_.isEmpty)))
					.value();
			});
	};

	model.resolve = function(args) {
		return soundcloud('/resolve', { url: _.result(args, 'url') });
	};

	model.tracks_comments = function(args) {
		return soundcloud('/tracks/' + _.result(args, 'id') + '/comments');
	};

	model.users_web_profiles = function(args) {
		return soundcloud('/users/' + _.result(args, 'id') + '/web-profiles');
	};

	return api;

	function soundcloud(endpoint, args) {
		return fetch('https://api.soundcloud.com' + endpoint + '?' + querystring.stringify(_.defaults({ client_id: params.key || process.env.SOUNDCLOUD_CLIENT_ID }, args)))
			.then(function(response) {
				if (response.ok) {
					return response.json();
				}
				switch (response.status) {
					case 401:
						throw new errors.Forbidden();
					case 403:
					case 404:
						throw new errors[response.status]();
					case 429:
						throw new errors.FeathersError(null, 'TooManyRequests', 429, 'too-many-requests');
					default:
						var err = response.status > 500 ?
							new errors.FeathersError(null, 'BadGateway', 502, 'bad-gateway') :
							new errors.GeneralError();
						err.original_code = response.status;
						throw err;
				}
			});
	}
};

function user_to_account(user) {
	var user_artwork_url = _.result(user, 'avatar_url', '');
	return !_.isEmpty(user) && _.pick({ api: 'soundcloud', type: 'account', id: _.result(user, 'permalink'), name: _.result(user, 'username'), image: !_.isEmpty(user_artwork_url) && !user_artwork_url.match(/default_avatar_large/) && { small: user_artwork_url, medium: user_artwork_url.replace('-large', '-t300x300'), large: user_artwork_url.replace('-large', '-t500x500') } }, _.negate(_.isEmpty));
}

function post_to_content(post) {
	var artwork_url = _.result(post, 'artwork_url', '');
	return !_.isEmpty(post) && _.pick({ api: 'soundcloud', type: 'content', id: _.result(post, 'permalink'), as: (_.result(post, 'kind') === 'playlist') && 'playlist', name: _.result(post, 'title'), date: Date.parse(_.result(post, 'created_at')), stats: _.result(post, 'kind') === 'playlist' ? { content: Number(_.result(post, 'track_count')) } : { likes: Number(_.result(post, 'favoritings_count')), views: Number(_.result(post, 'playback_count')), comments: Number(_.result(post, 'comment_count')) }, image: !artwork_url.match(/default_avatar_large/) && { small: artwork_url, medium: artwork_url.replace('-large', '-t300x300'), large: artwork_url.replace('-large', '-t500x500') }, account: user_to_account(post.user) }, _.somePredicate(_.isNumber, _.negate(_.isEmpty)));
}
