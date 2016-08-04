var _           = require('underscore');
var Autolinker  = require('autolinker');
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

	api.account_content = function(args) {
		var usage = {};

		var getUser = model.resolve({ url: urls.print(_.defaults({ api: 'soundcloud', type: 'account' }, args)) }, null, usage);

		return Promise.all([
			getUser
				.then(function(user) {
					return model.users_tracks(_.pick(user, 'id'), null, usage);
				}),
			getUser
				.then(function(user) {
					return model.users_playlists(_.pick(user, 'id'), null, usage);
				})
		])
			.then(function(results) {
				return _.pick(
					{
						api:     'soundcloud',
						type:    'account_content',
						id:      args.id,
						content: _.chain(results[0])
							.union(results[1])
							.sortBy(function(post) {
								return -Date.parse(post.created_at);
							})
							.first(config.counts.grid)
							.map(post_to_content)
							.each(function(content) {
								_.extend(content, _.isEmpty(content.account) && { account: _.pick(content.account, 'api', 'type', 'id') });
							})
							.reject(_.isEmpty)
							.value()
					},
					_.negate(_.isEmpty)
				);
			});
	};

	model.resolve = function(args) {
		return soundcloud('/resolve', { url: _.result(args, 'url') }).catch(catch_errors('SoundCloud Resolve'));
	};

	model.tracks_comments = function(args) {
		return soundcloud('/tracks/' + _.result(args, 'id') + '/comments').catch(catch_errors('SoundCloud Tracks Comments'));
	};

	model.users_playlists = function(args) {
		return soundcloud('/users/' + _.result(args, 'id') + '/playlists', { representation: 'compact' }).catch(catch_errors('SoundCloud Users Playlists'));
	};

	model.users_tracks = function(args) {
		return soundcloud('/users/' + _.result(args, 'id') + '/tracks').catch(catch_errors('SoundCloud Users Tracks'));
	};

	model.users_web_profiles = function(args) {
		return soundcloud('/users/' + _.result(args, 'id') + '/web-profiles').catch(catch_errors('SoundCloud Users Web Profiles'));
	};

	return api;

	function soundcloud(endpoint, args) {
		return fetch('https://api.soundcloud.com' + endpoint + '?' + querystring.stringify(_.defaults({ client_id: params.key || process.env.SOUNDCLOUD_CLIENT_ID }, args)))
			.then(function(response) {
				if (!response.ok) {
					var err = new Error(response.statusText);
					err.status = response.status;
					return Promise.reject(err);
				}
				return response.json();
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

function catch_errors(errName) {
	return function(err) {
		err.message = errName + ' - ' + String(err.message);
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
		return Promise.reject(err);
	};
}
