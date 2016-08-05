var _          = require('underscore');
var cheerio    = require('cheerio');
var config     = require('../config');
var promisify  = require('es6-promisify');
var request    = require('request');
var urls       = require('../urls');
var Autolinker = require('autolinker');
var Google     = require('googleapis');
require('../mixins');

var autolinker = new Autolinker();

module.exports = function(params) {
	var model = {};
	var api   = { model: model };
	var youtubes = _.map(params.keys || [params.key], function(key) {
		return Google.youtube({ version: 'v3', auth: key });
	});

	api.content = function(args) {
		var usage = { 'youtube-quota': 0 };

		return model.video(_.pick(args, 'id'), _.pick(args, 'device_id'), usage)
			.then(function(video) {
				var video_snippet    = _.result(video, 'snippet');
				var video_statistics = _.result(video, 'statistics');
				return _.chain(video_to_content(video)).extend({ id: _.result(video, 'id'), text: autolinker.link((_.result(video_snippet, 'description') || '').replace(/\n+$/, '').replace(/\n/g, '<br>')), stats: { likes: Number(_.result(video_statistics, 'likeCount')), dislikes: Number(_.result(video_statistics, 'dislikeCount')), views: Number(_.result(video_statistics, 'viewCount')) }, account: { api: 'youtube', type: 'account', id: _.result(video_snippet, 'channelId'), name: _.result(video_snippet, 'channelTitle') } }).pick(_.somePredicate(_.isNumber, _.negate(_.isEmpty))).value();
			});
	};

	api.discussion = function(args) {
		var usage = { 'youtube-quota': 0 };

		return model.comment_threads(_.pick(args, 'id'), _.pick(args, 'device_id'), usage)
			.then(function(comment_threads) {
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
				return _.pick({ api:      'youtube', type:     'discussion', id:       args.id, comments: _.chain(comment_threads).map(function(comment_thread) {
					var comment_thread_snippet         = _.result(comment_thread, 'snippet');
					var comment_thread_snippet_comment = _.result(comment_thread_snippet, 'topLevelComment');
					return _.extend(comment_to_comment(comment_thread_snippet_comment), { stats: { likes: Number(_.chain(comment_thread_snippet_comment).result('snippet').result('likeCount').value()), replies: Number(_.result(comment_thread_snippet, 'totalReplyCount')) }, replies: _.chain(comment_thread).result('replies').result('comments').map(comment_to_comment).reject(_.isEmpty).reverse().value() }); }).reject(_.isEmpty).filter(limit_comments).value() }, _.negate(_.isEmpty));
			});
	};

	api.account = function(args) {
		var usage = { 'scanning': 0, 'youtube-quota': 0 };

		var getAboutPage = model.about_page(_.pick(args, 'id', 'as'), null, usage);
		var getID        = (function() {
			switch (args.as) {
				case 'legacy_username':
					return model.channel_for_legacy(_.pick(args, 'id'), _.pick(args, 'device_id'), usage)
						.then(function(legacy_channel) {
							return _.result(legacy_channel, 'id');
						});
				case 'custom_url':
					return getAboutPage
						.then(function(aboutPage) {
							return _.result(aboutPage, 'id');
						});
				default:
					return Promise.resolve(_.result(args, 'id'));
			}
		}());

		return Promise.all([
			getAboutPage,
			getID,
			getID
				.then(function(id) {
					return model.channel({ id: id }, _.pick(args, 'device_id'), usage);
				})
		])
			.then(function(results) {
				var channel_snippet    = _.result(results[2], 'snippet');
				var channel_statistics = _.result(results[2], 'statistics');
				var channel_thumbnails = _.result(channel_snippet, 'thumbnails');

				var text = autolinker.link((_.result(channel_snippet, 'description') || '').replace(/\n+$/, '').replace(/\n/g, '<br>'));

				return _.pick({ api: 'youtube', type: 'account', id: results[1], name: _.result(channel_snippet, 'title'), text: text, image: { small: _.chain(channel_thumbnails).result('default').result('url').value(), medium: _.chain(channel_thumbnails).result('medium').result('url').value(), large: _.chain(channel_thumbnails).result('high').result('url').value() }, banner: _.chain(results[2]).result('brandingSettings').result('image').result('bannerMobileMediumHdImageUrl').value(), stats: _.mapObject({ content: Number(_.result(channel_statistics, 'videoCount')), followers: Number(_.result(channel_statistics, 'subscriberCount')), views: Number(_.result(channel_statistics, 'viewCount')) }), accounts: _.chain(results[0]).result('accounts').union(_.chain(text.match(/href="[^"]+"/g)).invoke('slice', 6, -1).map(urls.parse).where({ type: 'account' }).value()).uniq(false, function(account) { return account.api + '/' + account.id + '/' + account.as; }).value() }, _.negate(_.isEmpty));
			});
	};

	model.about_page = function(args, args_not_cached, usage) {
		usage.scanning++;

		return promisify(request, { multiArgs: true })({ url: urls.print(_.extend({ api: 'youtube', type: 'account' }, args)) + '/about' })
			.then(function(result) {
				if (_.result(result[0], 'statusCode') >= 400) {
					return Promise.reject({ status: result[0].statusCode, message: '' });
				}
				var $ = cheerio.load(result[1]);
				var id = _.result(urls.parse('https://www.youtube.com' + $('.channel-header-profile-image-container').attr('href')), 'id');
				if (!id) {
					return Promise.reject({ status: 404, message: '' });
				}
				return _.pick({ id: id, accounts: _.chain($('.about-metadata .about-channel-link').get()).map($).invoke('attr', 'href').map(urls.parse).where({ type: 'account' }).value() }, _.negate(_.isEmpty));
			})
			.catch(catch_errors('Youtube About Page'));
	};

	model.channel = function(args, args_not_cached, usage) {
		usage['youtube-quota'] += 9;
		var youtube = _.sample(youtubes);

		return promisify(youtube.channels.list.bind(youtube.channel), { multiArgs: true })({
			part:       'snippet,statistics,brandingSettings,contentDetails',
			id:         _.result(args, 'id'),
			quotaUser:  args_not_cached.device_id || params.device_id,
			maxResults: 1
		})
			.then(function(result) {
				if (_.result(result[1], 'statusCode') >= 400) {
					return Promise.reject({ status: result[1].statusCode, message: '' });
				}
				var channel = _.chain(result[0]).result('items').first().value();
				if (!_.isObject(channel)) {
					return Promise.reject({ status: 404, message: '' });
				}
				return _.chain(channel).pick('id', 'snippet', 'statistics', 'brandingSettings', 'contentDetails').pick(_.somePredicate(_.isNumber, _.negate(_.isEmpty))).value();
			})
			.catch(catch_errors('Youtube Channel'));
	};

	model.channel_for_legacy = function(args, args_not_cached, usage) {
		usage['youtube-quota'] += 1;
		var youtube = _.sample(youtubes);

		return promisify(youtube.channels.list.bind(youtube.channel), { multiArgs: true })({
			part:        'id',
			forUsername: _.result(args, 'id'),
			quotaUser:   args_not_cached.device_id || params.device_id,
			maxResults:  1
		})
			.then(function(result) {
				if (_.result(result[1], 'statusCode') >= 400) {
					return Promise.reject({ status: result[1].statusCode, message: '' });
				}
				var channel = _.chain(result[0]).result('items').first().value();
				if (!_.isObject(channel)) {
					return Promise.reject({ status: 404, message: '' });
				}
				return _.chain(channel).pick('id').pick(_.somePredicate(_.isNumber, _.negate(_.isEmpty))).value();
			})
			.catch(catch_errors('Youtube Channel (for Legacy)'));
	};

	model.comment_threads = function(args, args_not_cached, usage) {
		usage['youtube-quota'] += 5;
		var youtube = _.sample(youtubes);

		return promisify(youtube.commentThreads.list.bind(youtube.commentThreads), { multiArgs: true })({
			part:       'snippet,replies',
			videoId:    args.id,
			quotaUser:  args_not_cached.device_id || params.device_id,
			order:      'relevance',
			maxResults: config.counts.listed
		})
			.then(function(result) {
				if (_.result(result[1], 'statusCode') >= 400) {
					return Promise.reject({ status: result[1].statusCode, message: '' });
				}
				return _.chain(result[0]).result('items').reject(_.isEmpty).value();
			})
			.catch(catch_errors('Youtube Channel (for Legacy)'));
	};

	model.video = function(args, args_not_cached, usage) {
		usage['youtube-quota'] += 5;
		var youtube = _.sample(youtubes);

		return promisify(youtube.videos.list.bind(youtube.videos), { multiArgs: true })({
			part:      'snippet,statistics',
			id:        args.id,
			quotaUser: args_not_cached.device_id || params.device_id
		})
			.then(function(result) {
				if (_.result(result[1], 'statusCode') >= 400) {
					return Promise.reject({ status: result[1].statusCode, message: '' });
				}
				var video = _.chain(result[0]).result('items').first().value();
				if (!_.isObject(video)) {
					return Promise.reject({ status: 404, message: '' });
				}
				return _.chain(video).pick('id', 'snippet', 'statistics').pick(_.negate(_.isEmpty)).value();
			})
			.catch(catch_errors('Youtube Playlist Items'));
	};

	return api;
};

function video_to_content(video) {
	var video_snippet    = _.result(video, 'snippet');
	var video_thumbnails = _.result(video_snippet, 'thumbnails');
	return !_.isEmpty(video) && _.pick({ api: 'youtube', type: 'content', name: _.result(video_snippet, 'title'), date: Date.parse(_.result(video_snippet, 'publishedAt')), image: { small: _.chain(video_thumbnails).result('default').result('url').value(), medium: _.chain(video_thumbnails).result('medium').result('url').value(), large: _.chain(video_thumbnails).result('high').result('url').value() } }, _.somePredicate(_.isNumber, _.negate(_.isEmpty)));
}

function comment_to_comment(comment) {
	var comment_snippet = _.result(comment, 'snippet');
	return !_.isEmpty(comment) && _.pick({ api: 'youtube', type: 'comment', id: _.result(comment, 'id'), text: autolinker.link((_.result(comment_snippet, 'textDisplay') || '').replace(/\n+$/, '').replace(/\n/g, '<br>')), date: Date.parse(_.result(comment_snippet, 'publishedAt')), stats: { likes: Number(_.result(comment_snippet, 'likeCount')) }, account: { api: 'youtube', type: 'account', id: _.chain(comment_snippet).result('authorChannelId').result('value').value(), name: _.result(comment_snippet, 'authorDisplayName'), image: { small: _.result(comment_snippet, 'authorProfileImageUrl') } } }, _.somePredicate(_.isNumber, _.negate(_.isEmpty)));
}

function catch_errors(errName) {
	return function(err) {
		err.message = errName + ' - ' + String(err.message);
		switch (err.status) {
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
