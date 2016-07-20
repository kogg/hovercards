var _          = require('underscore');
var Autolinker = require( 'autolinker');
var Twit       = require('twit');
var async      = require('async');
var config     = require('../config');
var urls       = require('../urls');
require('../common/mixins');

module.exports = function(params) {
	var twitter = new Twit({ access_token: params.app_user, access_token_secret: params.app_user_secret, consumer_key: params.key, consumer_secret: params.secret });
	var model   = {};
	var api     = { model: model };

	function autolinker_with_entities(text, entities, entities_to_remove) {
		var url_to_entities           = _.indexBy(entities, 'url');
		var url_to_entities_to_remove = _.indexBy(entities_to_remove, 'url');
		return Autolinker.link(text, {
			hashtag: 'twitter',
			replaceFn: function(autolinker, match) {
				if (match.getType() !== 'url') {
					return;
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
			return;
		}
		var extend_with;
		if (!_.chain(tweet).result('retweeted_status').isEmpty().value()) {
			extend_with = { reposted_content: tweet_to_content(tweet.retweeted_status) };
		} else {
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
		}

		return _.chain({ api:     'twitter', type:    'content', id:      _.result(tweet, 'id_str'), date:    Date.parse(_.result(tweet, 'created_at')), account: user_to_account(_.result(tweet, 'user')) }) .extend(extend_with) .pick(_.somePredicate(_.isNumber, _.negate(_.isEmpty))) .value();
	}

	api.content = function(args, callback) {
		var usage = { 'twitter-statuses-show-calls': 0 };
		async.auto({
			tweet: function(callback) {
				model.statuses_show(_.pick(args, 'id'), _.pick(args, 'user'), usage, callback);
			},
			replied_to_tweet: ['tweet', function(callback, results) {
				if (_.chain(results.tweet).result('in_reply_to_status_id_str').isEmpty().value()) {
					return async.setImmediate(callback);
				}
				model.statuses_show({ id: results.tweet.in_reply_to_status_id_str }, _.pick(args, 'user'), usage, function(err, replied_to) {
					callback(null, replied_to);
				});
			}]
		}, function(err, results) {
			if (err) {
				return callback(err, null, usage);
			}

			callback(null, _.extend(tweet_to_content(results.tweet), results.replied_to_tweet && { replied_to_content: tweet_to_content(results.replied_to_tweet) }), usage);
		});
	};

	api.discussion = function(args, callback) {
		var usage = { 'twitter-search-tweets-calls': 0 };
		var query = { count: 50 };
		if (!_.chain(args).result('for').isEmpty().value()) {
			_.extend(query, { q: _.map(urls.represent(args.for), function(url) { return (url || '').replace(/^https?:\/\//, ''); }).join(' OR ') });
		} else {
			_.extend(query, { q:        'to:' + _.chain(args).result('account').result('id').value(), since_id: _.result(args, 'id') });
		}
		model.search_tweets(query, _.pick(args, 'user'), usage, function(err, tweets) {
			if (err) {
				return callback(err, null, usage);
			}
			callback(null, _.chain(args) .pick('id', 'for') .extend({ api:      'twitter', type:     'discussion', comments: _.chain(tweets) .map(function(tweet) { return _.result(tweet, 'retweeted_status', tweet); }) .where(query.since_id ? { in_reply_to_status_id_str: query.since_id } : {}) .uniq(false, _.property('id_str')) .first(config.counts.listed) .map(tweet_to_content) .value() }) .pick(_.negate(_.isEmpty)) .value(), usage);
		});
	};

	api.account = function(args, callback) {
		var usage = { 'twitter-user-show-calls': 0 };
		model.user_show(_.pick(args, 'id'), _.pick(args, 'user'), usage, function(err, user) {
			if (err) {
				return callback(err, null, usage);
			}

			var user_entities                  = _.result(user, 'entities');
			var user_profile_banner_url        = _.result(user, 'profile_banner_url');
			var user_description_urls_entities = _.chain(user_entities).result('description').result('urls').value();

			var text = autolinker_with_entities(_.result(user, 'description', ''), user_description_urls_entities);

			callback(null, _.chain(user_to_account(user)) .extend({ text:     text, verified: _.result(user, 'verified'), banner:   !_.isEmpty(user_profile_banner_url) && (user_profile_banner_url.replace(/\/$/, '') + '/1500x500'), stats:    { content:    Number(_.result(user, 'statuses_count')), followers:  Number(_.result(user, 'followers_count')), following:  Number(_.result(user, 'friends_count')) }, accounts: _.chain(user_entities) .result('url') .result('urls') .pluck('expanded_url') .union(_.invoke(text.match(/href="[^"]+"/g), 'slice', 6, -1)) .uniq() .map(urls.parse) .where({ type: 'account' }) .value() }) .pick(_.somePredicate(_.isNumber, _.negate(_.isEmpty), function(value) { return value === true; /* This exists for verified */ })) .value(), usage);
		});
	};

	api.account_content = function(args, callback) {
		var usage = { 'twitter-statuses-show-calls':          0, 'twitter-statuses-user-timeline-calls': 0 };
		async.auto({
			tweets: function(callback) {
				model.statuses_user_timeline(_.pick(args, 'id'), _.pick(args, 'user'), usage, callback);
			},
			replied_to_tweets: ['tweets', function(callback, results) {
				var tweet_ids      = _.pluck(results.tweets, 'id_str');
				var replied_to_ids = _.pluck(results.tweets, 'in_reply_to_status_id_str');
				async.map(_.chain(replied_to_ids).difference(tweet_ids).compact().value(), function(replied_to_id, callback) {
					model.statuses_show({ id: replied_to_id }, _.pick(args, 'user'), usage, function(err, replied_to_tweet) {
						callback(null, replied_to_tweet);
					});
				}, callback);
			}]
		}, function(err, results) {
			if (err) {
				return callback(err, null, usage);
			}

			var tweets = _.chain(results.tweets) .union(results.replied_to_tweets) .compact() .value();

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

			callback(null, _.pick({ api:     'twitter', type:    'account_content', id:      _.result(args, 'id'), content: _.chain(content) .map(_.partial(_.omit, _, 'account')) .reject(_.isEmpty) .value() }, _.negate(_.isEmpty)), usage);
		});
	};

	function provide_twit(user, callback) {
		if (_.isEmpty(user)) {
			return async.setImmediate(function() {
				callback(null, twitter);
			});
		}
		return params.secret_storage.get(user, function(err, secret) {
			if (err || _.isEmpty(secret)) {
				return callback({ status: 401 });
			}
			callback(null, new Twit({ access_token: user, access_token_secret: secret, consumer_key: params.key, consumer_secret: params.secret }));
		});
	}

	model.search_tweets = function(args, args_not_cached, usage, callback) {
		async.waterfall([
			async.apply(provide_twit, _.result(args_not_cached, 'user')),
			function(twitter, callback) {
				usage['twitter-search-tweets-calls']++;
				twitter.get('search/tweets', args, function(err, tweets_with_meta, response) {
					if (err || (_.result(response, 'statusCode') >= 400)) {
						var status = _.result(response, 'statusCode') || _.result(err, 'status') || _.result(err, 'statusCode');
						var code   = _.result(err, 'code');
						err = err ? { message: err.message } : {};
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
						return callback(err);
					}
					callback(null, _.result(tweets_with_meta, 'statuses'));
				});
			}
		], _.wrapErrorCallback(callback, 'Twitter Search Tweets'));
	};

	model.statuses_show = function(args, args_not_cached, usage, callback) {
		async.waterfall([
			async.apply(provide_twit, _.result(args_not_cached, 'user')),
			function(twitter, callback) {
				usage['twitter-statuses-show-calls']++;
				twitter.get('statuses/show/' + _.result(args, 'id'), {}, function(err, tweet, response) {
					if (err || (_.result(response, 'statusCode') >= 400)) {
						var status = _.result(response, 'statusCode') || _.result(err, 'status') || _.result(err, 'statusCode');
						var code   = _.result(err, 'code');
						err = err ? { message: err.message } : {};
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
						return callback(err);
					}
					callback(null, tweet);
				});
			}
		], _.wrapErrorCallback(callback, 'Twitter Statuses Show'));
	};

	model.statuses_user_timeline = function(args, args_not_cached, usage, callback) {
		async.waterfall([
			async.apply(provide_twit, _.result(args_not_cached, 'user')),
			function(twitter, callback) {
				usage['twitter-statuses-user-timeline-calls']++;
				twitter.get('statuses/user_timeline', { screen_name: _.result(args, 'id'), count: config.counts.listed }, function(err, tweets, response) {
					if (err || (_.result(response, 'statusCode') >= 400)) {
						var status = _.result(response, 'statusCode') || _.result(err, 'status') || _.result(err, 'statusCode');
						var code   = _.result(err, 'code');
						err = err ? { message: err.message } : {};
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
						return callback(err);
					}
					callback(null, tweets);
				});
			}
		], _.wrapErrorCallback(callback, 'Twitter Statuses User Timeline'));
	};

	model.user_show = function(args, args_not_cached, usage, callback) {
		async.waterfall([
			async.apply(provide_twit, _.result(args_not_cached, 'user')),
			function(twitter, callback) {
				usage['twitter-user-show-calls']++;
				twitter.get('users/show', { screen_name: _.result(args, 'id') }, function(err, user, response) {
					if (err || (_.result(response, 'statusCode') >= 400)) {
						var status = _.result(response, 'statusCode') || _.result(err, 'status') || _.result(err, 'statusCode');
						var code   = _.result(err, 'code');
						err = err ? { message: err.message } : {};
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
						return callback(err);
					}
					callback(null, user);
				});
			}
		], _.wrapErrorCallback(callback, 'Twitter User Show'));
	};

	return api;
};
