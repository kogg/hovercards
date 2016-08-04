var _          = require('underscore');
var Autolinker = require('autolinker');
var Twit       = require('twit');
var config     = require('../config');
var promisify  = require('es6-promisify');
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
						.catch(function() {
							return null;
						});
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
			_.extend(query, { q:        'to:' + _.chain(args).result('account').result('id').value(), since_id: _.result(args, 'id') });
		} else {
			_.extend(query, { q: _.map(urls.represent(args.for), function(url) { return (url || '').replace(/^https?:\/\//, ''); }).join(' OR ') });
		}

		return model.search_tweets(query, _.pick(args, 'user'), usage)
			.then(function(tweets) {
				return _.chain(args) .pick('id', 'for') .extend({ api:      'twitter', type:     'discussion', comments: _.chain(tweets) .map(function(tweet) { return _.result(tweet, 'retweeted_status', tweet); }) .where(query.since_id ? { in_reply_to_status_id_str: query.since_id } : {}) .uniq(false, _.property('id_str')) .first(config.counts.listed) .map(tweet_to_content) .value() }) .pick(_.negate(_.isEmpty)) .value();
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

				return _.chain(user_to_account(user)) .extend({ text:     text, verified: _.result(user, 'verified'), banner:   !_.isEmpty(user_profile_banner_url) && (user_profile_banner_url.replace(/\/$/, '') + '/1500x500'), stats:    { content:    Number(_.result(user, 'statuses_count')), followers:  Number(_.result(user, 'followers_count')), following:  Number(_.result(user, 'friends_count')) }, accounts: _.chain(user_entities) .result('url') .result('urls') .pluck('expanded_url') .union(_.invoke(text.match(/href="[^"]+"/g), 'slice', 6, -1)) .uniq() .map(urls.parse) .where({ type: 'account' }) .value() }) .pick(_.somePredicate(_.isNumber, _.negate(_.isEmpty), function(value) { return value === true; /* This exists for verified */ })) .value();
			});
	};

	api.account_content = function(args) {
		var usage = { 'twitter-statuses-show-calls': 0, 'twitter-statuses-user-timeline-calls': 0 };

		var getTweets = model.statuses_user_timeline(_.pick(args, 'id'), _.pick(args, 'user'), usage);

		return Promise.all([
			getTweets,
			getTweets
				.then(function(tweets) {
					var tweet_ids      = _.pluck(tweets, 'id_str');
					var replied_to_ids = _.pluck(tweets, 'in_reply_to_status_id_str');

					return Promise.all(
						_.chain(replied_to_ids)
							.difference(tweet_ids)
							.compact()
							.map(function(repliedToId) {
								return model.statuses_show({ id: repliedToId }, _.pick(args, 'user'), usage)
									.catch(function() {
										return null;
									});
							})
							.value()
					);
				})
		])
			.then(function(results) {
				var tweets = _.chain(results[0]) .union(results[1]) .compact() .value();

				var tweet_id_to_replied_to_id = _.chain(tweets) .indexBy('id_str') .mapObject(_.property('in_reply_to_status_id_str')) .value();

				var content       = _.map(tweets, tweet_to_content);
				var content_by_id = _.indexBy(content, 'id');

				_.each(content, function(tweet_as_content) {
					var replied_to_id = tweet_id_to_replied_to_id[tweet_as_content.id];
					if (!replied_to_id) {
						return;
					}
					var replied_to_tweet_as_content = content_by_id[replied_to_id];
					if (!replied_to_tweet_as_content) {
						return;
					}
					content = _.without(content, replied_to_tweet_as_content);
					tweet_as_content.replied_to_content = replied_to_tweet_as_content;
				});

				return _.pick({ api:     'twitter', type:    'account_content', id:      _.result(args, 'id'), content: _.chain(content) .map(_.partial(_.omit, _, 'account')) .reject(_.isEmpty) .value() }, _.negate(_.isEmpty));
			});
	};

	model.search_tweets = function(args, args_not_cached, usage) {
		return provide_twit(_.result(args_not_cached, 'user'))
			.then(function(twitter) {
				usage['twitter-search-tweets-calls']++;

				return twitter.get('search/tweets', args);
			})
			.then(function(result) {
				if (_.result(result.resp, 'statusCode') >= 400) {
					return Promise.reject({ status: result.resp.statusCode, message: '' });
				}
				return _.result(result.data, 'statuses');
			})
			.catch(catch_errors('Twitter Search Tweets', args_not_cached));
	};

	model.statuses_show = function(args, args_not_cached, usage) {
		return provide_twit(_.result(args_not_cached, 'user'))
			.then(function(twitter) {
				usage['twitter-statuses-show-calls']++;

				return twitter.get('statuses/show/' + _.result(args, 'id'), {});
			})
			.then(function(result) {
				if (_.result(result.resp, 'statusCode') >= 400) {
					return Promise.reject({ status: result.resp.statusCode, message: '' });
				}
				return result.data;
			})
			.catch(catch_errors('Twitter Statuses Show', args_not_cached));
	};

	model.statuses_user_timeline = function(args, args_not_cached, usage) {
		return provide_twit(_.result(args_not_cached, 'user'))
			.then(function(twitter) {
				usage['twitter-statuses-user-timeline-calls']++;

				return twitter.get('statuses/user_timeline', { screen_name: _.result(args, 'id'), count: config.counts.listed });
			})
			.then(function(result) {
				if (_.result(result.resp, 'statusCode') >= 400) {
					return Promise.reject({ status: result.resp.statusCode, message: '' });
				}
				return result.data;
			})
			.catch(catch_errors('Twitter Statuses User Timeline', args_not_cached));
	};

	model.user_show = function(args, args_not_cached, usage) {
		return provide_twit(_.result(args_not_cached, 'user'))
			.then(function(twitter) {
				usage['twitter-user-show-calls']++;

				return twitter.get('users/show', { screen_name: _.result(args, 'id') });
			})
			.then(function(result) {
				if (_.result(result.resp, 'statusCode') >= 400) {
					return Promise.reject({ status: result.resp.statusCode, message: '' });
				}
				return result.data;
			})
			.catch(catch_errors('Twitter User Show', args_not_cached));
	};

	return api;

	function provide_twit(user) {
		if (_.isEmpty(user)) {
			return Promise.resolve(twitter);
		}
		return promisify(params.secret_storage.get.bind(params.secret_storage))(user)
			.catch(function() {
				return Promise.reject({ status: 401, message: '' });
			})
			.then(function(secret) {
				if (_.isEmpty(secret)) {
					return Promise.reject({ status: 401, message: '' });
				}
				return new Twit({
					access_token:        user,
					access_token_secret: secret,
					consumer_key:        params.key || process.env.TWITTER_CONSUMER_KEY,
					consumer_secret:     params.secret || process.env.TWITTER_CONSUMER_SECRET
				});
			});
	}

	function catch_errors(errName, args_not_cached) {
		return function(err) {
			var status = err.status || err.statusCode;
			var code   = err.code;
			err.message = errName + ' - ' + String(err.message);
			switch (status) {
				case 401:
					if (code === 89) {
						params.secret_storage.del(args_not_cached.user, _.noop);
						err.status = 401;
					} else {
						err.status = args_not_cached.user ? 403 : 401;
					}
					break;
				case 403:
				case 404:
				case 429:
					err.status = status;
					break;
				default:
					err.status = (status >= 500) ? 502 : 500;
					err.original_status = status;
					break;
			}
			return Promise.reject(err);
		};
	}
};

function autolinker_with_entities(text, entities, entities_to_remove) {
	var url_to_entities           = _.indexBy(entities, 'url');
	var url_to_entities_to_remove = _.indexBy(entities_to_remove, 'url');
	return Autolinker.link(text, {
		hashtag: 'twitter',
		replaceFn: function(autolinker, match) {
			if (match.getType() !== 'url') {
				return null;
			}
			if (!_.isEmpty(url_to_entities_to_remove[match.getUrl()])) {
				return '';
			}
			var entity = url_to_entities[match.getUrl()];
			var tag = autolinker.getTagBuilder().build(match);
			return _.isEmpty(entity) ? tag : tag.setAttr('href', entity.expanded_url).setInnerHtml(entity.display_url);
		}
	});
}

function user_to_account(user) {
	var user_profile_image_url_https = _.result(user, 'profile_image_url_https');
	return !_.isEmpty(user) && _.pick({ api:   'twitter', type:  'account', id:    _.result(user, 'screen_name'), name:  _.result(user, 'name'), image: !_.result(user, 'default_profile_image') && !_.isEmpty(user_profile_image_url_https) && { small: user_profile_image_url_https.replace('_normal', '_bigger'), large: user_profile_image_url_https.replace('_normal', '') } }, _.negate(_.isEmpty));
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
		var first_entity_video_url = _.chain(first_entity) .result('video_info') .result('variants') .where({ content_type: 'video/mp4' }) .min(function(variant) { return Math.abs((variant.bitrate || 0) - 832000); }) .result('url') .value();

		var photo_entities = _.where(extended_entities, { type: 'photo' });

		var entities_to_keep   = _.chain(tweet).result('entities').result('urls').value();
		var entities_to_remove = extended_entities;
		var quoted_content;
		if (!_.chain(tweet).result('quoted_status').isEmpty().value()) {
			quoted_content = tweet_to_content(tweet.quoted_status);

			var quoted_url     = (urls.print(quoted_content) || '').toLowerCase();
			var entity_to_move = _.find(entities_to_keep, function(entity) { return (entity.expanded_url || '').toLowerCase() === quoted_url; });
			entities_to_keep = _.without(entities_to_keep, entity_to_move);
			entities_to_remove = _.union(entities_to_remove, [entity_to_move]);
		}

		extend_with = { text:           autolinker_with_entities((_.result(tweet, 'text') || '') .replace(/\n+$/, '') .replace(/\n/g, '<br>'), entities_to_keep, entities_to_remove), image:          !_.isEmpty(first_entity_media_url) && (photo_entities.length < 2) && { small:  first_entity_media_url + ':small', medium: first_entity_media_url + ':medium', large:  first_entity_media_url + ':large' }, images:         (photo_entities.length >= 2) && _.chain(photo_entities) .pluck('media_url_https') .map(function(media_url_https) {
			return { small:  media_url_https + ':small', medium: media_url_https + ':medium', large:  media_url_https + ':large' }; }) .value(), gif:            (_.result(first_entity, 'type') === 'animated_gif') && first_entity_video_url, video:          (_.result(first_entity, 'type') === 'video') && first_entity_video_url, stats:          { likes:   Number(_.result(tweet, 'favorite_count')), reposts: Number(_.result(tweet, 'retweet_count')) }, quoted_content: quoted_content };
	} else {
		extend_with = { reposted_content: tweet_to_content(tweet.retweeted_status) };
	}

	return _.chain({ api:     'twitter', type:    'content', id:      _.result(tweet, 'id_str'), date:    Date.parse(_.result(tweet, 'created_at')), account: user_to_account(_.result(tweet, 'user')) }) .extend(extend_with) .pick(_.somePredicate(_.isNumber, _.negate(_.isEmpty))) .value();
}
