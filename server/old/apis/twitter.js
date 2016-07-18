/* eslint-disable */
var _     = require('underscore');
var Twit  = require('twit');
var URI   = require('urijs/src/URI');
var async = require('async');

var network_urls = require('./network-urls');

module.exports = function(params) {
	var methods = {};

	var app_twitter = new Twit({ access_token: params.app_token, access_token_secret: params.app_token_secret, consumer_key: params.key, consumer_secret: params.secret });

	function use_twit(token, endpoint, endpoint_params, callback) {
		if (!token) {
			return app_twitter.get(endpoint, endpoint_params, function(err, body, response) {
				if (_.result(response, 'statusCode') >= 400) {
					err = _.extend({}, err, { status: response.statusCode || err.status || err.statusCode });
					if (err.status === 401 && !err.code) {
						err.status = 403;
					}
					return callback(err);
				}
				callback(null, body);
			});
		}
		async.waterfall([
			function(callback) {
				params.get_token_secret(token, function(err, token_secret) {
					if (err) {
						return callback(_.extend({ status: 500 }, err));
					}
					callback(!token_secret && { status: 401 }, token_secret);
				});
			},
			function(token_secret, callback) {
				new Twit({ access_token: token, access_token_secret: token_secret, consumer_key: params.key, consumer_secret: params.secret })
					.get(endpoint, endpoint_params, function(err, body, response) {
						if (_.result(response, 'statusCode') >= 400) {
							err = _.extend({}, err, { status: response.statusCode || err.status || err.statusCode });
							if (err.status === 401 && !err.code) {
								err.status = 403;
							}
							return callback(err);
						}
						callback(null, body);
					});
			}
		], function(err, body) {
			if (err && err.status === 401) {
				return params.del_token_secret(token, _.partial(callback, err, null));
			}
			callback(err, body);
		});
	}

	function handle_err(err, callback) {
		switch (err.status) {
			case 401:
			case 403:
			case 404:
			case 429:
			case 500:
				return callback({ status: err.status });
		}
		callback({ status: (err.status >= 500) ? 502 : 500 });
	}

	function prepare_tweet(body) {
		if (!_.isObject(body)) {
			return null;
		}
		var original_body = body;
		body = body.retweeted_status || body;
		if (!_.isObject(body)) {
			return null;
		}
		var media = _.result(body.extended_entities, 'media');
		var images = _.where(media, { type: 'photo' });
		var not_image = _.chain(media).difference(images).first().value();
		return { api:            'twitter',
		         type:           'content',
		         id:             body.id_str,
		         image:          _.result((images.length === 1 && images[0]) || not_image, 'media_url_https'),
		         images:         images.length > 1 && _.pluck(images, 'media_url_https'),
		         video_is_image: _.result(not_image, 'type') === 'animated_gif',
		         video:          (_.result(not_image, 'type') in { animated_gif: 1, video: 1 }) &&
		                         _.chain(not_image)
		                          .result('video_info')
		                          .result('variants')
		                          .max(function(video) {
		                              return (video.content_type === 'video/mp4') ? video.bitrate + 100000000000 : video.bitrate;
		                          })
		                          .result('url')
		                          .value(),
		         description:    body.text && _.chain(['hashtags', 'media', 'urls', 'user_mentions'])
		                                       .map(function(name) {
		                                           return _.chain(body.entities)
		                                                   .result(name)
		                                                   .map(function(thing) {
		                                                       return _.extend({ from: name }, thing);
		                                                   })
		                                                   .value();
		                                       })
		                                       .flatten(true)
		                                       .filter(function(thing) {
		                                           return _.chain(thing).result('indices').result('length').value() === 2;
		                                       })
		                                       .sortBy(function(thing) {
		                                           return thing.indices[0];
		                                       })
		                                       .reduceRight(function(text, thing) {
		                                           var string = '';
		                                           switch (thing.from) {
		                                               case 'hashtags':
		                                                   string = '<a href="https://twitter.com/hashtag/' + thing.text + '">#' + thing.text + '</a>';
		                                                   break;
		                                               case 'urls':
		                                                   if (body.quoted_status_id_str) {
		                                                       var url_identity = network_urls.identify(thing.expanded_url);
		                                                       if (_.result(url_identity, 'api') === 'twitter' && _.result(url_identity, 'type') === 'content' && _.result(url_identity, 'id') === body.quoted_status_id_str) {
		                                                           break;
		                                                       }
		                                                   }
		                                                   string = '<a href="' + thing.expanded_url + '">' + thing.display_url + '</a>';
		                                                   break;
		                                               case 'user_mentions':
		                                                   string = '<a href="https://twitter.com/' + thing.screen_name + '">@' + thing.screen_name + '</a>';
		                                                   break;
		                                           }
		                                           return text.substr(0, thing.indices[0]) + string + text.substr(thing.indices[1]);
		                                       }, body.text)
		                                       .value()
		                                       .replace(/\n+$/, '')
		                                       .replace(/\n/g, '<br>'),
		         date:           Date.parse(body.created_at),
		         retweets:       body.retweet_count,
		         favorites:      body.favorite_count,
		         author:         _.result(body.user, 'screen_name') && { api:   'twitter',
		                                                                 type:  'account',
		                                                                 id:    body.user.screen_name,
		                                                                 name:  body.user.name,
		                                                                 image: (body.user.profile_image_url_https || '')
		                                                                        .replace('_normal', '')
		                                                                        .replace(/^.*\/default_profile_images\/default_profile_\d+.*$/, '') || null },
		         retweet:        (original_body !== body) && prepare_tweet(_.omit(original_body, 'retweeted_status')),
		         quoted:         prepare_tweet(body.quoted_status) };
	}

	/*
	 * Main Methods
	 */

	methods.content = function(args, callback) {
		if (!_.isObject(args)) {
			return callback({ status: 400 });
		}
		async.auto({
			body: async.apply(methods.__tweet, { id: args.id }, { user: args.user }),
			reply: ['body', function(callback, results) {
				if (!_.result(results.body, 'in_reply_to_status_id_str')) {
					return callback();
				}
				methods.__tweet({ id: results.body.in_reply_to_status_id_str }, { user: args.user }, function(err, reply) {
					callback(null, reply);
				});
			}]
		}, function(err, results) {
			if (err) {
				return callback(err);
			}
			var tweet = prepare_tweet(results.body);
			var reply = prepare_tweet(results.reply);
			callback(null, _.extend(tweet, { replied_to: reply,
			                                 accounts:   _.chain([_.chain(tweet).result('author').pick('api', 'type', 'id').extend({ reason: 'author' }).value()])
			                                              .union(reply && [_.chain(reply).result('author').pick('api', 'type', 'id').value()])
			                                              .union(tweet.quoted && [_.chain(tweet.quoted).result('author').pick('api', 'type', 'id').value()])
			                                              .union(tweet.retweet && [_.chain(tweet.retweet).result('author').pick('api', 'type', 'id').value()])
			                                              .union(_.chain(results.body)
			                                                      .result('entities')
			                                                      .result('user_mentions')
			                                                      .pluck('screen_name')
			                                                      .map(function(screen_name) {
			                                                          return { api: 'twitter', type: 'account', id: screen_name, reason: 'mention' };
			                                                      })
			                                                      .value())
			                                              .union(_.chain(results.body)
			                                                      .result('entities')
			                                                      .result('urls')
			                                                      .pluck('expanded_url')
			                                                      .map(network_urls.identify)
			                                                      .where({ type: 'account' })
			                                                      .each(function(account) { account.reason = 'mention'; })
			                                                      .value())
			                                              .uniq(false, function(account) { return account.api + '/' + account.id + '/' + account.as; })
			                                              .value() }));
		});
	};

	methods.discussion = function(args, callback) {
		if (!_.isObject(args)) {
			return callback({ status: 400 });
		}
		if (args.for) {
			var query = methods.query(args.for);
			if (!_.isObject(query)) {
				return callback({ status: 400 });
			}
			return methods.__search_tweets({ q: query.q, count: 10 }, { user: args.user }, function(err, body) {
				if (err) {
					return callback(err);
				}
				callback(null, { api:      'twitter',
				                 type:     'discussion',
				                 for:      args.for,
				                 comments: _.map(body.statuses, prepare_tweet) });
			});
		}
		var comments = [];
		var max_id;
		var done = false;
		var called_num = 0;
		async.whilst(
			function() { return !done; },
			function(callback) {
				var query = { q:        'to:' + _.result(args.author, 'id'),
							  count:    100,
							  since_id: args.id };
				if (max_id) {
					query.max_id = max_id;
				}
				methods.__search_tweets(query, { user: args.user }, function(err, body) {
					if (err) {
						return callback(err);
					}
					body = body.statuses;
					if (body.length <= 1) {
						done = true;
						return callback();
					}
					comments = _.chain(comments)
					            .union(_.chain(body)
					                    .where({ in_reply_to_status_id_str: args.id })
					                    .reject(function(tweet) {
					                        return tweet.id_str === max_id;
					                    })
					                    .value())
					            .first(10)
					            .value();
					if (comments.length === 10) {
						done = true;
						return callback();
					}
					called_num++;
					if (called_num === 3) {
						done = true;
						return callback();
					}
					max_id = _.chain(body)
							  .pluck('id_str')
							  .min()
							  .value() || max_id;
					callback();
				});
			},
			function(err) {
				if (err) {
					return callback(err);
				}
				if (!comments.length && called_num === 3) {
					return callback({ status: 501 });
				}
				callback(null, { api:      'twitter',
				                 type:     'discussion',
				                 id:       args.id,
				                 comments: _.map(comments, prepare_tweet) });
			}
		);
	};

	methods.account = function(args, callback) {
		if (!_.isObject(args)) {
			return callback({ status: 400 });
		}
		methods.__account({ id: args.id }, { user: args.user }, callback);
	};

	methods.more_content = function(args, callback) {
		if (!_.isObject(args)) {
			return callback({ status: 400 });
		}
		methods.__user_tweets({ id: args.id }, { user: args.user }, function(err, tweets) {
			if (err) {
				return callback(err);
			}
			callback(null, { api:     'twitter',
			                 type:    'more_content',
			                 id:      args.id,
			                 content: tweets.content });
		});
	};

	methods.url = function(args, callback) {
		if (!_.isObject(args)) {
			return callback({ status: 400 });
		}
		methods.discussion({ for: { id: args.id, type: 'url' }, user: args.user }, callback);
	};

	methods.query = function(args) {
		if (!_.isObject(args)) {
			return null;
		}
		switch (args.type) {
			case 'url':
				var url = (URI(args.id || '').toString() || '').replace(/^http:\/\//, '').replace(/^https:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');
				return { q: url + ' filter:links' };
			case 'content':
				switch (args.api) {
					case 'imgur':
						return { q: 'site:imgur.com ' + args.id + ' (filter:links OR filter:images)' };
					case 'instagram':
						return { q: '(site:instagram.com OR site:instagr.am) p/' + args.id + ' (filter:links OR filter:images)' };
					case 'soundcloud':
						return { q: 'site:soundcloud.com ' + _.result(args.author, 'id') + (args.as === 'playlist' ? '/sets' : '') + '/' + args.id + ' filter:links' };
					case 'youtube':
						return { q: '(site:youtube.com OR site:youtu.be) (' + (args.id || '').replace(/^-+/, '') + ' OR 3D' + args.id + ') (filter:links OR filter:videos)' };
				}
				break;
		}
	};

	/*
	 * Cacheable Methods
	 */

	methods.__tweet = function(args, more_args, callback) {
		use_twit(more_args.user, 'statuses/show/:id', { id: args.id }, function(err, tweet) {
			if (err) {
				return handle_err(err, callback);
			}
			if (!_.isObject(tweet)) {
				return callback({ status: 404 });
			}
			if (tweet && more_args.user) {
				tweet.dont_cache = true;
			}
			callback(null, tweet);
		});
	};

	methods.__search_tweets = function(args, more_args, callback) {
		var input = { q: args.q, count: args.count };
		if (args.max_id) {
			input.max_id = args.max_id;
		}
		if (args.since_id) {
			input.since_id = args.since_id;
		}
		use_twit(more_args.user, 'search/tweets', input, function(err, body) {
			if (err) {
				return handle_err(err, callback);
			}
			if (!_.isObject(body) || !_.isArray(body.statuses)) {
				return callback({ status: 404 });
			}
			body.dont_cache = !!more_args.user;
			callback(null, body);
		});
	};

	methods.__account = function(args, more_args, callback) {
		use_twit(more_args.user, 'users/show', { screen_name: args.id }, function(err, body) {
			if (err) {
				return handle_err(err, callback);
			}
			if (!_.isObject(body)) {
				return callback({ status: 404 });
			}
			var links = _.chain(body.entities)
			             .result('url')
			             .result('urls')
			             .value();
			var connected_account = network_urls.identify(_.chain(links)
			                                               .pluck('expanded_url')
			                                               .first()
			                                               .value());
			var is_account = _.result(connected_account, 'type') === 'account';

			callback(null, _.chain(body)
			                .pick('name', 'location', 'url', 'verified')
			                .extend({ dont_cache:  !!more_args.user,
			                          api:         'twitter',
			                          type:        'account',
			                          id:          body.screen_name,
			                          image:       (body.profile_image_url_https || '').replace('_normal', '').replace(/^.*\/default_profile_images\/default_profile_\d+.*$/, '') || null,
			                          description: body.description && _.chain(body.entities)
			                                                            .result('description')
			                                                            .result('urls')
			                                                            .filter(function(thing) {
			                                                                return _.chain(thing).result('indices').result('length').value() === 2;
			                                                            })
			                                                            .sortBy(function(thing) {
			                                                                return thing.indices[0];
			                                                            })
			                                                            .reduceRight(function(description, thing) {
			                                                                return description.substr(0, thing.indices[0]) +
			                                                                    '<a href="' + thing.expanded_url + '">' + thing.display_url + '</a>' +
			                                                                    description.substr(thing.indices[1]);
			                                                            }, body.description)
			                                                            .value(),
			                          tweets:      body.statuses_count,
			                          following:   body.friends_count,
			                          followers:   body.followers_count,
			                          url_link:    body.url && !is_account && _.chain(links)
			                                                                   .filter(function(thing) {
			                                                                       return _.chain(thing).result('indices').result('length').value() === 2;
			                                                                   })
			                                                                   .sortBy(function(thing) {
			                                                                       return thing.indices[0];
			                                                                   })
			                                                                   .reduceRight(function(url_link, thing) {
			                                                                       return url_link.substr(0, thing.indices[0]) +
			                                                                           '<a href="' + thing.expanded_url + '">' + thing.display_url + '</a>' +
			                                                                           url_link.substr(thing.indices[1]);
			                                                                   }, body.url)
			                                                                   .value(),
			                          connected:   _.chain(is_account && [connected_account])
			                                        .union(_.chain(body.entities)
			                                                .result('description')
			                                                .result('urls')
			                                                .pluck('expanded_url')
			                                                .map(network_urls.identify)
			                                                .where({ type: 'account' })
			                                                .value())
			                                        .uniq(false, function(account) { return account.api + '/' + account.id + '/' + account.as; })
			                                        .value() })
			                .value());
		});
	};

	methods.__user_tweets = function(args, more_args, callback) {
		use_twit(more_args.user, 'statuses/user_timeline', { screen_name: args.id, count: 10 }, function(err, body) {
			if (err) {
				return handle_err(err, callback);
			}
			if (!_.isArray(body)) {
				return callback({ status: 404 });
			}
			callback(null, { dont_cache: !!more_args.user,
							 content:    _.map(body, prepare_tweet) });
		});
	};

	return methods;
};
