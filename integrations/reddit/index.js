var _        = require('underscore');
var Snoocore = require('snoocore');
var errors   = require('feathers-errors');

var config = require('../config');
var urls   = require('../urls');
require('../mixins');

module.exports = function(params) {
	var model = {};
	var api   = { model: model };

	var reddit = new Snoocore({
		userAgent:          'node:HoverCards:v2 (by /u/HoverCards)',
		decodeHtmlEntities: true,
		throttle:           0,
		retryDelay:         params.test ? 0 : 5000, // TODO Find a better way
		retryAttempts:      2,
		oauth:              {
			type:        'implicit',
			key:         params.key || process.env.REDDIT_CLIENT_ID,
			redirectUri: 'http://localhost:8000',
			scope:       ['read', 'history'],
			deviceId:    params.device_id || 'DO_NOT_TRACK_THIS_DEVICE'
		}
	});

	api.content = function(args) {
		var usage = { 'reddit-requests': 0 };

		return model.article_comments(_.pick(args, 'id'), null, usage)
			.then(function(commentTree) {
				return post_to_content(
					_.chain(commentTree)
						.first()
						.result('data')
						.result('children')
						.first()
						.result('data')
						.value()
				);
			});
	};

	api.discussion = function(args) {
		var usage = { 'reddit-requests': 0 };

		var getCommentsArgs = _.chain(args).result('for').isEmpty().value() ?
			Promise.resolve(args) :
			model.search({
				q: _.chain(urls.represent(args.for))
					.map(function(url) {
						return 'url:"' + (url || '').replace(/^https?:\/\//, '') + '"';
					})
					.join(' OR ')
					.value()
			}, null, usage)
				.then(function(searchResults) {
					var pick_for = _.pick(args.for, 'api', 'type', 'id', 'as');
					var content = _.chain(searchResults)
						.where({ kind: 't3' })
						.pluck('data')
						.each(function(post) {
							return _.isEqual(urls.parse(post.url), pick_for);
						})
						.max('num_comments')
						.value();
					return _.isEmpty(content) ? Promise.reject('none') : content;
				});

		return getCommentsArgs
			.then(function(commentsArgs) {
				return model.article_comments(_.pick(commentsArgs, 'id'), null, usage);
			})
			.then(function(commentTree) {
				var post = _.chain(commentTree)
					.first()
					.result('data')
					.result('children')
					.first()
					.result('data')
					.value();
				return _.chain(args)
					.pick('id', 'for')
					.extend({
						api:      'reddit',
						type:     'discussion',
						id:       _.result(post, 'id'),
						content:  post_to_content(post),
						comments: _.chain(commentTree)
							.last()
							.result('data')
							.result('children')
							.where({ kind: 't1' })
							.pluck('data')
							.map(comment_to_comment)
							.reject(_.isEmpty)
							.value()
					})
					.pick(_.somePredicate(_.isNumber, _.negate(_.isEmpty)))
					.value();
			})
			.catch(function(err) {
				if (err === 'none') {
					return _.chain(args)
						.pick('id', 'for')
						.extend({
							api:      'reddit',
							type:     'discussion',
							comments: []
						})
						.pick(_.somePredicate(_.isNumber, _.negate(_.isEmpty)))
						.value();
				}
				throw err;
			});
	};

	api.account = function(args) {
		var usage = { 'reddit-requests': 0 };

		return model.user_about(_.pick(args, 'id'), null, usage)
			.then(function(user) {
				return _.pick(
					{
						api:   'reddit',
						type:  'account',
						id:    _.result(user, 'name'),
						date:  Number(_.result(user, 'created_utc')) * 1000,
						stats: _.pick(user, 'link_karma', 'comment_karma')
					},
					_.somePredicate(_.isNumber, _.negate(_.isEmpty))
				);
			});
	};

	model.article_comments = function(args, args_not_cached, usage) {
		usage['reddit-requests']++;

		return reddit('/comments/$article').get({ $article: _.result(args, 'id'), limit: config.counts.listed })
			.catch(catch_error);
	};

	model.search = function(args, args_not_cached, usage) {
		usage['reddit-requests']++;

		return reddit('/search').get({ q: _.result(args, 'q'), limit: 25 })
			.catch(catch_error)
			.then(function(searchResults) {
				return _.chain(searchResults)
					.result('data')
					.result('children')
					.value();
			});
	};

	model.user_about = function(args, args_not_cached, usage) {
		usage['reddit-requests']++;

		return reddit('/user/$username/about').get({ $username: _.result(args, 'id') })
			.catch(catch_error)
			.then(function(body) {
				var user = _.result(body, 'data');
				if (!_.isObject(user)) {
					throw new errors.NotFound();
				}
				return user;
			});
	};

	return api;
};

function catch_error(err) {
	switch (err.status) {
		case 404:
			throw new errors.NotFound(err);
		case 429:
			throw new errors.FeathersError(err, 'TooManyRequests', 429, 'too-many-requests');
		default:
			var original_status = err.status;
			err = err.status > 500 ?
				new errors.FeathersError(err, 'BadGateway', 502, 'bad-gateway') :
				new errors.GeneralError(err);
			err.original_code = original_status;
			throw err;
	}
}

function post_to_content(post) {
	var author  = _.result(post, 'author');
	var gifs    = [];
	var images  = [];
	var preview = _.chain(post).result('preview').result('images').first().value();

	if (preview) {
		images = _.chain(preview.resolutions).union([preview.source]).compact().value();
		gifs = _.chain(preview)
			.result('variants')
			.result('mp4')
			.value();
		if (gifs) {
			gifs = _.chain(gifs.resolutions).union([gifs.source]).compact().value();
		}
	}

	return !_.isEmpty(post) && _.pick(
		{
			api:       'reddit',
			type:      'content',
			id:        _.result(post, 'id'),
			name:      _.result(post, 'title'),
			date:      Number(_.result(post, 'created_utc')) * 1000,
			subreddit: _.result(post, 'subreddit'),
			url:       !_.result(post, 'is_self') && _.result(post, 'url'),
			account:   (author !== '[deleted]') && { api: 'reddit', type: 'account', id: author },
			oembed:    _.chain(post).result('media').result('oembed').result('html').value(),
			image:     !_.isEmpty(images) && {
				small: _.chain(images)
					.min(function(image) {
						return Math.abs(image.width - 80);
					})
					.result('url')
					.value(),
				medium: _.chain(images)
					.min(function(image) {
						return Math.abs(image.width - 300);
					})
					.result('url')
					.value(),
				large: _.chain(images)
					.min(function(image) {
						return Math.abs(image.width - 600);
					})
					.result('url')
					.value()
			},
			gif: !_.isEmpty(gifs) && _.chain(gifs)
				.min(function(gif) {
					return Math.abs(gif.width - 300);
				})
				.result('url')
				.value(),
			text: _.result(post, 'is_self') && (_.result(post, 'selftext_html') || '')
				.replace(/\n/gi, '')
				.replace(/<!-- .*? -->/gi, '')
				.replace(/^\s*<div class="md">(.*?)<\/div>\s*$/, '$1')
				.replace(/<a href="\/([^"]*?)">(.*?)<\/a>/gi, '<a href="https://www.reddit.com/$1">$2</a>'),
			stats: {
				score:       Number(_.result(post, 'score')),
				score_ratio: Number(_.result(post, 'upvote_ratio')),
				comments:    Number(_.result(post, 'num_comments'))
			}
		},
		_.somePredicate(_.isNumber, _.negate(_.isEmpty))
	);
}

function comment_to_comment(comment) {
	if (_.isEmpty(comment)) {
		return null;
	}
	var author = _.result(comment, 'author');

	return _.pick(
		{
			api:     'reddit',
			type:    'comment',
			id:      _.result(comment, 'id'),
			date:    Number(_.result(comment, 'created_utc')) * 1000,
			stats:   { score: Number(_.result(comment, 'score')) },
			account: (author !== '[deleted]') && { api: 'reddit', type: 'account', id: author },
			text:    (_.result(comment, 'body_html') || '')
				.replace(/\n/gi, '')
				.replace(/<!-- .*? -->/gi, '')
				.replace(/^\s*<div class="md">(.*?)<\/div>\s*$/, '$1')
				.replace(/<a href="\/([^"]*?)">(.*?)<\/a>/gi, '<a href="https://www.reddit.com/$1">$2</a>'),
			replies: _.chain(comment)
				.result('replies')
				.result('data')
				.result('children')
				.where({ kind: 't1' })
				.pluck('data')
				.map(comment_to_comment)
				.reject(_.isEmpty)
				.value()
		},
		_.somePredicate(_.isNumber, _.negate(_.isEmpty))
	);
}
