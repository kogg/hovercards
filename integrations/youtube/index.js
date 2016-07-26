var _          = require('underscore');
var Autolinker = require( 'autolinker' );
var Google     = require('googleapis');
var async      = require('async');
var cheerio    = require('cheerio');
var config     = require('../config');
var request    = require('request');
var urls       = require('../urls');
require('../common/mixins');

module.exports = function(params) {
	var youtubes = _.map(params.keys || [params.key], function(key) {
		return Google.youtube({ version: 'v3', auth: key });
	});
	var model = {};
	var api   = { model: model };

	var autolinker = new Autolinker();

	function video_to_content(video) {
		var video_snippet    = _.result(video, 'snippet');
		var video_thumbnails = _.result(video_snippet, 'thumbnails');
		return !_.isEmpty(video) && _.pick({ api:   'youtube', type:  'content', name:  _.result(video_snippet, 'title'), date:  Date.parse(_.result(video_snippet, 'publishedAt')), image: { small:  _.chain(video_thumbnails).result('default').result('url').value(), medium: _.chain(video_thumbnails).result('medium').result('url').value(), large:  _.chain(video_thumbnails).result('high').result('url').value() } }, _.somePredicate(_.isNumber, _.negate(_.isEmpty)));
	}

	function comment_to_comment(comment) {
		var comment_snippet = _.result(comment, 'snippet');
		return !_.isEmpty(comment) && _.pick({ api:     'youtube', type:    'comment', id:      _.result(comment, 'id'), text:    autolinker.link((_.result(comment_snippet, 'textDisplay') || '') .replace(/\n+$/, '') .replace(/\n/g, '<br>')), date:    Date.parse(_.result(comment_snippet, 'publishedAt')), stats:   { likes: Number(_.result(comment_snippet, 'likeCount')) }, account: { api:   'youtube', type:  'account', id:    _.chain(comment_snippet).result('authorChannelId').result('value').value(), name:  _.result(comment_snippet, 'authorDisplayName'), image: { small: _.result(comment_snippet, 'authorProfileImageUrl') } } }, _.somePredicate(_.isNumber, _.negate(_.isEmpty)));
	}

	api.content = function(args, callback) {
		var usage = { 'youtube-quota': 0 };
		model.video(_.pick(args, 'id'), _.pick(args, 'device_id'), usage, function(err, video) {
			if (err) {
				return callback(err, null, usage);
			}

			var video_snippet    = _.result(video, 'snippet');
			var video_statistics = _.result(video, 'statistics');
			callback(err, _.chain(video_to_content(video)) .extend({ id:      _.result(video, 'id'), text:    autolinker.link((_.result(video_snippet, 'description') || '') .replace(/\n+$/, '') .replace(/\n/g, '<br>')), stats:   { likes:    Number(_.result(video_statistics, 'likeCount')), dislikes: Number(_.result(video_statistics, 'dislikeCount')), views:    Number(_.result(video_statistics, 'viewCount')) }, account: { api:  'youtube', type: 'account', id:   _.result(video_snippet, 'channelId'), name: _.result(video_snippet, 'channelTitle') } }) .pick(_.somePredicate(_.isNumber, _.negate(_.isEmpty))) .value(), usage);
		});
	};

	api.discussion = function(args, callback) {
		var usage = { 'youtube-quota': 0 };
		model.comment_threads(_.pick(args, 'id'), _.pick(args, 'device_id'), usage, function(err, comment_threads) {
			if (err) {
				return callback(err, null, usage);
			}

			var num_comments = 0;
			function limit_comments(comment) {
				num_comments++;
				if (num_comments > config.counts.listed) {
					return false;
				}
				if (comment.replies) {
					comment.replies = _.filter(comment.replies, limit_comments);
				}
				return true;
			}
			callback(null, _.pick({ api:      'youtube', type:     'discussion', id:       args.id, comments: _.chain(comment_threads) .map(function(comment_thread) {
			                                       													var comment_thread_snippet         = _.result(comment_thread, 'snippet');
			                                       													var comment_thread_snippet_comment = _.result(comment_thread_snippet, 'topLevelComment');
			                                       													return _.extend(comment_to_comment(comment_thread_snippet_comment), { stats:   { likes:   Number(_.chain(comment_thread_snippet_comment).result('snippet').result('likeCount').value()), replies: Number(_.result(comment_thread_snippet, 'totalReplyCount')) }, replies: _.chain(comment_thread) .result('replies') .result('comments') .map(comment_to_comment) .reject(_.isEmpty) .reverse() .value() }); }) .reject(_.isEmpty) .filter(limit_comments) .value() }, _.negate(_.isEmpty)), usage);
		});
	};

	api.account = function(args, callback) {
		var usage = { scanning: 0, 'youtube-quota': 0 };
		async.auto({
			about_page: function(callback) {
				model.about_page(_.pick(args, 'id', 'as'), null, usage, callback);
			},
			id: (function() {
				switch (args.as) {
					case 'legacy_username':
						return function(callback) {
							model.channel_for_legacy(_.pick(args, 'id'), _.pick(args, 'device_id'), usage, function(err, legacy_channel) {
								callback(err, _.result(legacy_channel, 'id'));
							});
						};
					case 'custom_url':
						return ['about_page', function(callback, results) {
							return callback(null, _.result(results.about_page, 'id'));
						}];
					default:
						return async.constant(_.result(args, 'id'));
				}
			}()),
			channel: ['id', function(callback, results) {
				model.channel(_.pick(results, 'id'), _.pick(args, 'device_id'), usage, callback);
			}]
		}, function(err, results) {
			if (err) {
				return callback(err, null, usage);
			}

			var channel_snippet    = _.result(results.channel, 'snippet');
			var channel_statistics = _.result(results.channel, 'statistics');
			var channel_thumbnails = _.result(channel_snippet, 'thumbnails');

			var text = autolinker.link((_.result(channel_snippet, 'description') || '') .replace(/\n+$/, '') .replace(/\n/g, '<br>'));

			callback(null, _.pick({ api:      'youtube', type:     'account', id:       results.id, name:     _.result(channel_snippet, 'title'), text:     text, image:    { small:  _.chain(channel_thumbnails).result('default').result('url').value(), medium: _.chain(channel_thumbnails).result('medium').result('url').value(), large:  _.chain(channel_thumbnails).result('high').result('url').value() }, banner:   _.chain(results.channel).result('brandingSettings').result('image').result('bannerMobileMediumHdImageUrl').value(), stats:    _.mapObject({ content:   Number(_.result(channel_statistics, 'videoCount')), followers: Number(_.result(channel_statistics, 'subscriberCount')), views:     Number(_.result(channel_statistics, 'viewCount')) }), accounts: _.chain(results.about_page) .result('accounts') .union(_.chain(text.match(/href="[^"]+"/g)) .invoke('slice', 6, -1) .map(urls.parse) .where({ type: 'account' }) .value()) .uniq(false, function(account) { return account.api + '/' + account.id + '/' + account.as; }) .value() }, _.negate(_.isEmpty)), usage);
		});
	};

	api.account_content = function(args, callback) {
		var usage = { 'youtube-quota': 0 };
		async.waterfall([
			function(callback) {
				model.channel(_.pick(args, 'id'), _.pick(args, 'device_id'), usage, callback);
			},
			function(channel, callback) {
				model.playlist_items({ id: _.chain(channel) .result('contentDetails') .result('relatedPlaylists') .result('uploads') .value() }, _.pick(args, 'device_id'), usage, callback);
			}
		], function(err, playlist_items) {
			if (err) {
				return callback(err, null, usage);
			}

			callback(null, _.pick({ api:     'youtube', type:    'account_content', id:      _.result(args, 'id'), content: _.chain(playlist_items) .map(function(video) {
			                                      													return _.extend(video_to_content(video), { id: _.chain(video) .result('snippet') .result('resourceId') .result('videoId') .value() }); }) .reject(_.isEmpty) .value() }, _.negate(_.isEmpty)), usage);
		});
	};

	model.about_page = function(args, args_not_cached, usage, callback) {
		callback = _.wrapErrorCallback(callback, 'Youtube About Page');

		usage.scanning++;
		request({ url: urls.print(_.extend({ api: 'youtube', type: 'account' }, args)) + '/about' }, function(err, response, body) {
			if (_.result(response, 'statusCode') >= 400) {
				err = err ? { message: err.message } : {};
				switch (response.statusCode) {
					case 404:
					case 429:
						err.status = response.statusCode;
						break;
					default:
						err.status = (response.statusCode >= 500) ? 502 : 500;
						err.original_status = response.statusCode;
						break;
				}
			}
			if (err) {
				return callback(err);
			}
			var $ = cheerio.load(body);
			var id = _.result(urls.parse('https://www.youtube.com' + $('.channel-header-profile-image-container').attr('href')), 'id');
			if (!id) {
				return callback({ status: 404 });
			}
			callback(null, _.pick({ id:       id, accounts: _.chain($('.about-metadata .about-channel-link').get()) .map($) .invoke('attr', 'href') .map(urls.parse) .where({ type: 'account' }) .value() }, _.negate(_.isEmpty)));
		});
	};

	model.channel = function(args, args_not_cached, usage, callback) {
		callback = _.wrapErrorCallback(callback, 'Youtube Channel');

		usage['youtube-quota'] += 9;
		_.sample(youtubes).channels.list(
			{
				part:       'snippet,statistics,brandingSettings,contentDetails',
				id:         _.result(args, 'id'),
				quotaUser:  args_not_cached.device_id || params.device_id,
				maxResults: 1
			},
			function(err, body, response) {
				if (_.result(response, 'statusCode') >= 400) {
					err = err ? { message: err.message } : {};
					switch (response.statusCode) {
						case 404:
						case 429:
							err.status = response.statusCode;
							break;
						default:
							err.status = (response.statusCode >= 500) ? 502 : 500;
							err.original_status = response.statusCode;
							break;
					}
				}
				if (err) {
					return callback(err);
				}
				var channel = _.chain(body) .result('items') .first() .value();
				if (!_.isObject(channel)) {
					return callback({ status: 404 });
				}
				callback(null, _.chain(channel) .pick('id', 'snippet', 'statistics', 'brandingSettings', 'contentDetails') .pick(_.somePredicate(_.isNumber, _.negate(_.isEmpty))) .value());
			}
		);
	};

	model.channel_for_legacy = function(args, args_not_cached, usage, callback) {
		callback = _.wrapErrorCallback(callback, 'Youtube Channel (for Legacy)');

		usage['youtube-quota'] += 1;
		_.sample(youtubes).channels.list(
			{
				part:        'id',
				forUsername: _.result(args, 'id'),
				quotaUser:   args_not_cached.device_id || params.device_id,
				maxResults:  1
			},
			function(err, body, response) {
				if (_.result(response, 'statusCode') >= 400) {
					err = err ? { message: err.message } : {};
					switch (response.statusCode) {
						case 404:
						case 429:
							err.status = response.statusCode;
							break;
						default:
							err.status = (response.statusCode >= 500) ? 502 : 500;
							err.original_status = response.statusCode;
							break;
					}
				}
				if (err) {
					return callback(err);
				}
				var channel = _.chain(body) .result('items') .first() .value();
				if (!_.isObject(channel)) {
					return callback({ status: 404 });
				}
				callback(null, _.chain(channel) .pick('id') .pick(_.somePredicate(_.isNumber, _.negate(_.isEmpty))) .value());
			}
		);
	};

	model.comment_threads = function(args, args_not_cached, usage, callback) {
		callback = _.wrapErrorCallback(callback, 'Youtube Comment Threads');

		usage['youtube-quota'] += 5;
		_.sample(youtubes).commentThreads.list(
			{
				part:       'snippet,replies',
				videoId:    args.id,
				quotaUser:  args_not_cached.device_id || params.device_id,
				order:      'relevance',
				maxResults: config.counts.listed
			},
			function(err, body, response) {
				if (_.result(response, 'statusCode') >= 400) {
					err = err ? { message: err.message } : {};
					switch (response.statusCode) {
						case 403:
						case 404:
						case 429:
							err.status = response.statusCode;
							break;
						default:
							err.status = (response.statusCode >= 500) ? 502 : 500;
							err.original_status = response.statusCode;
							break;
					}
				}
				if (err) {
					return callback(err);
				}
				callback(null, _.chain(body) .result('items') .reject(_.isEmpty) .value());
			}
		);
	};

	model.playlist_items = function(args, args_not_cached, usage, callback) {
		callback = _.wrapErrorCallback(callback, 'Youtube Playlist Items');

		usage['youtube-quota'] += 3;
		_.sample(youtubes).playlistItems.list(
			{
				part:       'snippet',
				playlistId: args.id,
				quotaUser:  args_not_cached.device_id || params.device_id,
				maxResults: config.counts.grid
			},
			function(err, body, response) {
				if (_.result(response, 'statusCode') >= 400) {
					err = err ? { message: err.message } : {};
					switch (response.statusCode) {
						case 404:
						case 429:
							err.status = response.statusCode;
							break;
						default:
							err.status = (response.statusCode >= 500) ? 502 : 500;
							err.original_status = response.statusCode;
							break;
					}
				}
				if (err) {
					return callback(err);
				}
				callback(null, _.chain(body) .result('items') .reject(_.isEmpty) .value());
			}
		);
	};

	model.video = function(args, args_not_cached, usage, callback) {
		callback = _.wrapErrorCallback(callback, 'Youtube Video');

		usage['youtube-quota'] += 5;
		_.sample(youtubes).videos.list(
			{
				part:      'snippet,statistics',
				id:        args.id,
				quotaUser: args_not_cached.device_id || params.device_id
			},
			function(err, body, response) {
				if (_.result(response, 'statusCode') >= 400) {
					err = err ? { message: err.message } : {};
					switch (response.statusCode) {
						case 404:
						case 429:
							err.status = response.statusCode;
							break;
						default:
							err.status = (response.statusCode >= 500) ? 502 : 500;
							err.original_status = response.statusCode;
							break;
					}
				}
				if (err) {
					return callback(err);
				}
				var video = _.chain(body) .result('items') .first() .value();
				if (!_.isObject(video)) {
					return callback({ status: 404 });
				}
				callback(null, _.chain(video) .pick('id', 'snippet', 'statistics') .pick(_.negate(_.isEmpty)) .value());
			}
		);
	};

	return api;
};
