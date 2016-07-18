/* eslint-disable */
var _       = require('underscore');
var Google  = require('googleapis');
var async   = require('async');
var cheerio = require('cheerio');
var request = require('request');

var network_urls = require('./network-urls');
require('./mixins');

module.exports = function(params) {
	var methods = {};

	var youtube = Google.youtube({ version: 'v3', auth: params.key });

	/*
	 * Main Methods
	 */

	methods.content = function(args, callback) {
		if (!_.isObject(args)) {
			return callback({ status: 400 });
		}
		methods.__video({ id: args.id }, { device_id: args.device_id }, function(err, item) {
			if (err) {
				return callback(err);
			}
			callback(null, { api:         'youtube',
			                 type:        'content',
			                 id:          args.id,
			                 image:       _.chain(item.snippet.thumbnails).result('high').result('url').value(),
			                 name:        _.result(item.snippet.localized, 'title'),
			                 description: _.chain(item.snippet.localized)
			                               .result('description')
			                               .urlsToLinks()
			                               .value()
			                               .replace(/\n+$/, '')
			                               .replace(/\n/g, '<br>'),
			                 date:        Date.parse(item.snippet.publishedAt),
			                 views:       parseInt(item.statistics.viewCount),
			                 likes:       parseInt(item.statistics.likeCount),
			                 dislikes:    parseInt(item.statistics.dislikeCount),
			                 author:      { api: 'youtube', type: 'account', id: item.snippet.channelId, name: item.snippet.channelTitle },
			                 accounts:    _.chain([{ api: 'youtube', type: 'account', id: item.snippet.channelId, reason: 'author' }])
			                               .union(_.chain(item.snippet.localized)
			                                       .result('description')
			                                       .extractURLs()
			                                       .map(network_urls.identify)
			                                       .where({ type: 'account' })
			                                       .each(function(account) { account.reason = 'mention'; })
			                                       .value())
			                               .uniq(false, function(account) { return account.api + '/' + account.id + '/' + account.as; })
			                               .value() });
		});
	};

	methods.discussion = function(args, callback) {
		if (!_.isObject(args)) {
			return callback({ status: 400 });
		}
		async.parallel({
			comments: async.apply(methods.__comments, { id: args.id }, { device_id: args.device_id }),
			video: function(callback) {
				methods.__video({ id: args.id }, { device_id: args.device_id }, function(err, item) {
					callback(null, item);
				});
			}
		}, function(err, results) {
			if (err) {
				return callback(err);
			}
			var response = { api:      'youtube',
			                 type:     'discussion',
			                 id:       args.id,
			                 comments: results.comments };
			var commentCount = parseInt(_.chain(results.video).result('statistics').result('commentCount').value());
			if (commentCount >= 0) {
				response.count = commentCount;
			}
			callback(null, response);
		});
	};

	methods.account = function(args, callback) {
		if (!_.isObject(args)) {
			return callback({ status: 400 });
		}
		async.waterfall([
			function(callback) {
				if (args.as !== 'custom_url') {
					return callback(null, null, args);
				}
				methods.__account_about_links({ id: args.id, as: args.as }, null, function(err, links) {
					callback(err, links, _.result(links, 'args'));
				});
			},
			function(links, args2, callback) {
				async.parallel(_.extend(
					{ channel: async.apply(methods.__channel, { id:          (args2.as !== 'legacy_username') && args2.id,
																forUsername: (args2.as === 'legacy_username') && args2.id },
															  { device_id: args.device_id }) },
					!links && { about_links: function(callback) {
						methods.__account_about_links({ id: args2.id, as: args2.as }, null, function(err, links) {
							callback(null, links || {});
						});
					} }
				), function(err, results) {
					callback(err, _.defaults(results, { about_links: links }));
				});
			}
		], function(err, results) {
			if (err) {
				return callback(err);
			}
			results.about_links = _.omit(results.about_links, 'args');
			callback(null, _.chain({ api: 'youtube', type: 'account'})
			                .extend(_.omit(results.channel, 'playlist_id'))
			                .extend(results.about_links)
			                .extend({ connected: _.chain(results.about_links.connected)
			                                      .union(results.channel.connected)
			                                      .uniq(false, function(account) { return account.api + '/' + account.id + '/' + account.as; })
			                                      .value() })
			                .value());
		});
	};

	methods.more_content = function(args, callback) {
		if (!_.isObject(args)) {
			return callback({ status: 400 });
		}
		async.waterfall([
			async.apply(methods.__channel, { id: args.id }, { device_id: args.device_id }),
			function(channel, callback) {
				if (!channel.playlist_id) {
					return callback({ status: 404 });
				}
				methods.__playlist_items({ playlist_id: channel.playlist_id }, { device_id: args.device_id }, function(err, playlistItems) {
					if (err) {
						return callback(err);
					}
					callback(null, { api:     'youtube',
					                 type:    'more_content',
					                 id:      args.id,
					                 content: playlistItems });
				});
			}
		], callback);
	};

	/*
	 * Cacheable Methods
	 */

	methods.__video = function(args, more_args, callback) {
		youtube.videos.list({ part: 'snippet,statistics', id: args.id, quotaUser: more_args.device_id }, function(err, body, response) {
			if (_.result(response, 'statusCode') >= 400) {
				switch (response.statusCode) {
					case 404:
					case 429:
						return callback({ status: response.statusCode });
				}
				return callback({ status: (response.statusCode >= 500) ? 502 : 500 });
			}
			var item = _.chain(body).result('items').first().value();
			if (!_.isObject(item) || !_.isObject(item.snippet) || !_.isObject(item.statistics)) {
				return callback({ status: 404 });
			}
			callback(null, item);
		});
	};

	methods.__comments = function(args, more_args, callback) {
		youtube.commentThreads.list({ part: 'snippet', maxResults: 10, videoId: args.id, quotaUser: more_args.device_id }, function(err, body, response) {
			if (_.result(response, 'statusCode') >= 400) {
				switch (response.statusCode) {
					case 403:
					case 404:
					case 429:
						return callback({ status: response.statusCode });
				}
				return callback({ status: (response.statusCode >= 500) ? 502 : 500 });
			}
			if (!body) {
				return callback({ status: 404 });
			}
			callback(null, _.chain(body)
			                .result('items')
			                .pluck('snippet')
			                .pluck('topLevelComment')
			                .filter(_.isObject)
			                .filter(function(topLevelComment) {
			                    return _.isObject(topLevelComment.snippet);
			                })
			                .map(function(topLevelComment) {
			                    return { id:          topLevelComment.id,
			                             description: topLevelComment.snippet.textDisplay,
			                             date:        Date.parse(topLevelComment.snippet.publishedAt),
			                             author:      { api:   'youtube',
			                                            type:  'account',
			                                            id:    _.result(topLevelComment.snippet.authorChannelId, 'value'),
			                                            name:  topLevelComment.snippet.authorDisplayName,
			                                            image: topLevelComment.snippet.authorProfileImageUrl } };
			                })
			                .value());
		});
	};

	methods.__channel = function(args, more_args, callback) {
		var input = { part: 'snippet,statistics,contentDetails', quotaUser: more_args.device_id };
		if (args.id) {
			input.id = args.id;
		} else if (args.forUsername) {
			input.forUsername = args.forUsername;
		}
		youtube.channels.list(input, function(err, body, response) {
			if (_.result(response, 'statusCode') >= 400) {
				switch (response.statusCode) {
					case 404:
					case 429:
						return callback({ status: response.statusCode });
				}
				return callback({ status: (response.statusCode >= 500) ? 502 : 500 });
			}
			var item = _.chain(body).result('items').first().value();
			if (!_.isObject(item) || !_.isObject(item.snippet) || !_.isObject(item.statistics) || !_.isObject(item.contentDetails)) {
				return callback({ status: 404 });
			}
			callback(null, { id:          item.id,
			                 image:       _.chain(item.snippet.thumbnails).result('medium').result('url').value(),
			                 name:        _.result(item.snippet.localized, 'title'),
			                 description: _.chain(item.snippet.localized)
			                               .result('description')
			                               .urlsToLinks()
			                               .value()
			                               .replace(/\n+$/, '')
			                               .replace(/\n/g, '<br>'),
			                 videos:      parseInt(item.statistics.videoCount),
			                 views:       parseInt(item.statistics.viewCount),
			                 subscribers: parseInt(item.statistics.subscriberCount),
			                 connected:   _.chain(_.chain(item.snippet.localized).result('description').extractURLs().value())
			                               .map(network_urls.identify)
			                               .where({ type: 'account' })
			                               .uniq(false, function(account) { return account.api + '/' + account.id + '/' + account.as; })
			                               .value(),
			                 playlist_id: _.chain(item).result('contentDetails').result('relatedPlaylists').result('uploads').value() });
		});
	};

	methods.__account_about_links = function(args, more_args, callback) {
		var account_url = network_urls.generate(_.extend({ api: 'youtube', type: 'account' }, args));
		if (!account_url) {
			return callback({ status: 400 });
		}
		request({ url: account_url + '/about' }, function(err, response) {
			err = err || (response.statusCode >= 400 && { status: response.statusCode }) || (!_.isString(response.body) && { status: 404 });
			if (err) {
				return callback(err);
			}
			var $ = cheerio.load(response.body);
			if (!_.isObject($)) {
				return callback({ status: 404 });
			}
			var about_links = _.chain($('.about-metadata .about-channel-link').get())
			                   .map($)
			                   .map(function(link) {
			                       return { title: link.find('.about-channel-link-text').text(), url: link.attr('href') };
			                   })
			                   .value();
			var website = _.find(about_links, function(link) { return _.result(network_urls.identify(link.url), 'type') !== 'account'; });
			callback(null, { args:      network_urls.identify('https://www.youtube.com' + $('.channel-header-profile-image-container').attr('href')) || {},
			                 url_link:  website && ('<a href="' + website.url + '">' + (website.title || website.url) + '</a>'),
			                 connected: _.chain(about_links)
			                             .pluck('url')
			                             .map(network_urls.identify)
			                             .where({ type: 'account' })
			                             .uniq(false, function(account) { return account.api + '/' + account.id + '/' + account.as; })
			                             .value() });
		});
	};
	methods.__account_about_links.cache_options = { version: 2 };

	methods.__playlist_items = function(args, more_args, callback) {
		youtube.playlistItems.list({ part: 'snippet', maxResults: 10, playlistId: args.playlist_id, quotaUser: more_args.device_id }, function(err, body, response) {
			if (_.result(response, 'statusCode') >= 400) {
				switch (response.statusCode) {
					case 404:
						return callback();
					case 429:
						return callback({ status: response.statusCode });
				}
				return callback({ status: (response.statusCode >= 500) ? 502 : 500 });
			}
			callback(null, _.chain(body)
			                .result('items')
			                .pluck('snippet')
			                .filter(_.isObject)
			                .map(function(snippet) {
			                    return { api:         'youtube',
			                             type:        'content',
			                             id:          _.result(snippet.resourceId, 'videoId'),
			                             name:        snippet.title,
			                             description: snippet.description,
			                             date:        Date.parse(snippet.publishedAt),
			                             image:       _.chain(snippet.thumbnails).result('medium').result('url').value() };
			                })
			                .value());
		});
	};

	return methods;
};
