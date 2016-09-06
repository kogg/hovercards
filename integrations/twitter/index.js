var _          = require('underscore');
var Autolinker = require('autolinker');
var Twit       = require('twit');
var errors     = require('feathers-errors');

var config     = require('../config');
var urls       = require('../urls');
require('../mixins');

module.exports = function(params) {
	var model   = {};
	var api     = { model: model };
	var twitter = new Twit({
		access_token:        params.app_user || process.env.TWITTER_APP_ACCESS_TOKEN,
		access_token_secret: params.app_user_secret || process.env.TWITTER_APP_ACCESS_TOKEN_SECRET,
		consumer_key:        params.key || process.env.TWITTER_CONSUMER_KEY,
		consumer_secret:     params.secret || process.env.TWITTER_CONSUMER_SECRET
	});

	api.content = function(args) {
		var usage = { 'twitter-statuses-show-calls': 0 };

		var getTweet = model.statuses_show(_.pick(args, 'id'), _.pick(args, 'user'), usage);

		return Promise.all([
			getTweet,
			getTweet
				.then(function(tweet) {
					if (_.chain(tweet).result('in_reply_to_status_id_str').isEmpty().value()) {
						return null;
					}
					return model.statuses_show({ id: tweet.in_reply_to_status_id_str }, _.pick(args, 'user'), usage)
						.catch(_.constant(null));
				})
		])
			.then(function(results) {
				return _.extend(tweet_to_content(results[0]), results[1] && { replied_to_content: tweet_to_content(results[1]) });
			});
	};

	api.discussion = function(args) {
		var usage = { 'twitter-search-tweets-calls': 0 };

		var query = { count: 50 };
		if (_.chain(args).result('for').isEmpty().value()) {
			_.extend(query, { q: 'to:' + _.chain(args).result('account').result('id').value(), since_id: _.result(args, 'id') });
		} else {
			_.extend(query, { q: _.map(urls.represent(Object.assign({ api: 'twitter' }, args.for)), function(url) { return (url || '').replace(/^https?:\/\//, ''); }).join(' OR ') });
		}

		return model.search_tweets(query, _.pick(args, 'user'), usage)
			.then(function(tweets) {
				return _.chain(args).pick('id', 'for').extend({ api: 'twitter', type: 'discussion', comments: _.chain(tweets).map(function(tweet) { return _.result(tweet, 'retweeted_status', tweet); }).where(query.since_id ? { in_reply_to_status_id_str: query.since_id } : {}).uniq(false, _.property('id_str')).first(config.counts.listed).map(tweet_to_content).value() }).pick(_.negate(_.isEmpty)).value();
			});
	};

	api.account = function(args) {
		var usage = { 'twitter-user-show-calls': 0 };

		return model.user_show(_.pick(args, 'id'), _.pick(args, 'user'), usage)
			.then(function(user) {
				var user_entities                  = _.result(user, 'entities');
				var user_profile_banner_url        = _.result(user, 'profile_banner_url');
				var user_description_urls_entities = _.chain(user_entities).result('description').result('urls').value();

				var text = autolinker_with_entities(_.result(user, 'description', ''), user_description_urls_entities);

				return _.chain(user_to_account(user)).extend({ text: text, verified: _.result(user, 'verified'), banner: !_.isEmpty(user_profile_banner_url) && (user_profile_banner_url.replace(/\/$/, '') + '/1500x500'), stats: { content: Number(_.result(user, 'statuses_count')), followers: Number(_.result(user, 'followers_count')), following: Number(_.result(user, 'friends_count')) }, accounts: _.chain(user_entities).result('url').result('urls').pluck('expanded_url').union(_.invoke(text.match(/href="[^"]+"/g), 'slice', 6, -1)).uniq().map(urls.parse).where({ type: 'account' }).value() }).pick(_.somePredicate(_.isNumber, _.negate(_.isEmpty), function(value) { return value === true; /* This exists for verified */ })).value();
			});
	};

	model.search_tweets = function(args, args_not_cached, usage) {
		return provide_twit(_.result(args_not_cached, 'user'))
			.then(function(twitter) {
				usage['twitter-search-tweets-calls']++;

				return twitter.get('search/tweets', args)
					.then(handle_response(args_not_cached))
					.then(_.property('statuses'));
			});
	};

	model.statuses_show = function(args, args_not_cached, usage) {
		return provide_twit(_.result(args_not_cached, 'user'))
			.then(function(twitter) {
				usage['twitter-statuses-show-calls']++;

				return twitter.get('statuses/show/' + _.result(args, 'id'), {})
					.then(handle_response(args_not_cached));
			});
	};

	model.user_show = function(args, args_not_cached, usage) {
		return provide_twit(_.result(args_not_cached, 'user'))
			.then(function(twitter) {
				usage['twitter-user-show-calls']++;

				return twitter.get('users/show', { screen_name: _.result(args, 'id') })
					.then(handle_response(args_not_cached));
			});
	};

	return api;

	function provide_twit(user) {
		if (_.isEmpty(user)) {
			return Promise.resolve(twitter);
		}
		return params.secret_storage.get(user)
			.catch(function() {
				throw new errors.NotAuthenticated();
			})
			.then(function(secret) {
				if (_.isEmpty(secret)) {
					throw new errors.NotAuthenticated();
				}
				return new Twit({
					access_token:        user,
					access_token_secret: secret,
					consumer_key:        params.key || process.env.TWITTER_CONSUMER_KEY,
					consumer_secret:     params.secret || process.env.TWITTER_CONSUMER_SECRET
				});
			});
	}

	function handle_response(args_not_cached) {
		return function(result) {
			if (_.result(result.resp, 'statusCode') < 400) {
				return result.data;
			}
			switch (result.resp.statusCode) {
				case 401:
					if (_.chain(result.data.errors).first().result('code').value() === 89) {
						params.secret_storage.del(args_not_cached.user);
						throw new errors.NotAuthenticated();
					}
					throw args_not_cached.user ?
						new errors.Forbidden() :
						new errors.NotAuthenticated();
				case 403:
				case 404:
					throw new errors[result.resp.statusCode]();
				case 429:
					throw new errors.FeathersError(null, 'TooManyRequests', 429, 'too-many-requests');
				default:
					var err = result.resp.statusCode > 500 ?
						new errors.FeathersError(null, 'BadGateway', 502, 'bad-gateway') :
						new errors.GeneralError();
					err.original_code = result.resp.statusCode;
					throw err;
			}
		};
	}
};

function autolinker_with_entities(text, entities, entities_to_remove) {
	var url_to_entities           = _.indexBy(entities, 'url');
	var url_to_entities_to_remove = _.indexBy(entities_to_remove, 'url');
	return Autolinker.link(text, {
		mention: 'twitter',
		hashtag: 'twitter',
		replaceFn: function(match) {
			if (match.getType() !== 'url') {
				return true;
			}
			if (!_.isEmpty(url_to_entities_to_remove[match.getUrl()])) {
				return '';
			}
			var entity = url_to_entities[match.getUrl()];
			var tag = match.buildTag();
			return _.isEmpty(entity) ? tag : tag.setAttr('href', entity.expanded_url).setInnerHtml(entity.display_url);
		}
	});
}

function user_to_account(user) {
	var user_profile_image_url_https = _.result(user, 'profile_image_url_https');
	return !_.isEmpty(user) && _.pick({ api: 'twitter', type: 'account', id: _.result(user, 'screen_name'), name: _.result(user, 'name'), image: !_.result(user, 'default_profile_image') && !_.isEmpty(user_profile_image_url_https) && { small: user_profile_image_url_https.replace('_normal', '_bigger'), large: user_profile_image_url_https.replace('_normal', '') } }, _.negate(_.isEmpty));
}

function tweet_to_content(tweet) {
	if (_.isEmpty(tweet)) {
		return null;
	}
	var extend_with;
	if (_.chain(tweet).result('retweeted_status').isEmpty().value()) {
		var extended_entities = _.chain(tweet).result('extended_entities').result('media', []).value();

		var first_entity           = _.first(extended_entities);
		var first_entity_media_url = _.result(first_entity, 'media_url_https');
		var first_entity_video_url = _.chain(first_entity)
			.result('video_info')
			.result('variants')
			.where({ content_type: 'video/mp4' })
			.min(function(variant) {
				return Math.abs((variant.bitrate || 0) - 832000);
			})
			.result('url')
			.value();

		var photo_entities = _.where(extended_entities, { type: 'photo' });

		var entities_to_keep   = _.chain(tweet).result('entities').result('urls').value();
		var entities_to_remove = extended_entities;
		var quoted_content;
		if (!_.chain(tweet).result('quoted_status').isEmpty().value()) {
			quoted_content = tweet_to_content(tweet.quoted_status);

			var quoted_url     = (urls.print(quoted_content) || '').toLowerCase();
			var entity_to_move = _.find(entities_to_keep, function(entity) {
				return (entity.expanded_url || '').toLowerCase() === quoted_url;
			});
			entities_to_keep = _.without(entities_to_keep, entity_to_move);
			entities_to_remove = _.union(entities_to_remove, [entity_to_move]);
		}

		extend_with = {
			text:  autolinker_with_entities((_.result(tweet, 'text') || '').replace(/\n+$/, '').replace(/\n/g, '<br>'), entities_to_keep, entities_to_remove),
			image: !_.isEmpty(first_entity_media_url) && (photo_entities.length < 2) && {
				small:  first_entity_media_url + ':small',
				medium: first_entity_media_url + ':medium',
				large:  first_entity_media_url + ':large'
			},
			images: (photo_entities.length >= 2) && _.chain(photo_entities)
				.pluck('media_url_https')
				.map(function(media_url_https) {
					return {
						small:  media_url_https + ':small',
						medium: media_url_https + ':medium',
						large:  media_url_https + ':large'
					};
				})
				.value(),
			gif:   (_.result(first_entity, 'type') === 'animated_gif') && first_entity_video_url,
			video: (_.result(first_entity, 'type') === 'video') && first_entity_video_url,
			stats: {
				likes:   Number(_.result(tweet, 'favorite_count')),
				reposts: Number(_.result(tweet, 'retweet_count'))
			},
			quoted_content: quoted_content
		};
	} else {
		extend_with = { reposted_content: tweet_to_content(tweet.retweeted_status) };
	}

	return _.pick(
		Object.assign(
			{
				api:     'twitter',
				type:    'content',
				id:      _.result(tweet, 'id_str'),
				date:    Date.parse(_.result(tweet, 'created_at')),
				account: user_to_account(_.result(tweet, 'user'))
			},
			extend_with
		),
		_.somePredicate(_.isNumber, _.negate(_.isEmpty))
	);
}
