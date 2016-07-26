var _        = require('underscore');
var Snoocore = require('snoocore');
var async    = require('async');
var config   = require('../config');
var urls     = require('../urls');
require('../common/mixins');

module.exports = function(params) {
	var model = {};
	var api   = { model: model };

	var reddit = new Snoocore({ userAgent:          'node:HoverCards:v2 (by /u/HoverCards)', decodeHtmlEntities: true, throttle:           0, retryDelay:         params.test ? 0 : 5000, retryAttempts:      2, oauth:              { type:        'implicit', key:         params.key, redirectUri: 'http://localhost:8000', scope:       ['read', 'history'], deviceId:    params.device_id || 'DO_NOT_TRACK_THIS_DEVICE' } });

	function post_to_content(post) {
		var author = _.result(post, 'author');
		return !_.isEmpty(post) && _.pick({ api:       'reddit', type:      'content', id:        _.result(post, 'id'), name:      _.result(post, 'title'), text:      _.result(post, 'is_self') && (_.result(post, 'selftext_html') || '') .replace(/\n/gi, '') .replace(/<!-- .*? -->/gi, '') .replace(/^\s*<div class="md">(.*?)<\/div>\s*$/, '$1') .replace(/<a href="\/([^"]*?)">(.*?)<\/a>/gi, '<a href="https://www.reddit.com/$1">$2</a>'), date:      Number(_.result(post, 'created_utc')) * 1000, subreddit: _.result(post, 'subreddit'), url:       !_.result(post, 'is_self') && _.result(post, 'url'), stats:     { score:       Number(_.result(post, 'score')), score_ratio: Number(_.result(post, 'upvote_ratio')), comments:    Number(_.result(post, 'num_comments')) }, account:   (author !== '[deleted]') && { api:  'reddit', type: 'account', id:   author } }, _.somePredicate(_.isNumber, _.negate(_.isEmpty)));
	}

	function comment_to_comment(comment) {
		if (_.isEmpty(comment)) {
			return;
		}
		var author = _.result(comment, 'author');
		return _.pick({ api:     'reddit', type:    'comment', id:      _.result(comment, 'id'), text:    (_.result(comment, 'body_html') || '') .replace(/\n/gi, '') .replace(/<!-- .*? -->/gi, '') .replace(/^\s*<div class="md">(.*?)<\/div>\s*$/, '$1') .replace(/<a href="\/([^"]*?)">(.*?)<\/a>/gi, '<a href="https://www.reddit.com/$1">$2</a>'), date:    Number(_.result(comment, 'created_utc')) * 1000, stats:   { score: Number(_.result(comment, 'score')) }, account: (author !== '[deleted]') && { api:  'reddit', type: 'account', id:   author }, replies: _.chain(comment) .result('replies') .result('data') .result('children') .where({ kind: 't1' }) .pluck('data') .map(comment_to_comment) .reject(_.isEmpty) .value() }, _.somePredicate(_.isNumber, _.negate(_.isEmpty)));
	}

	// FIXME all apis need this treatment
	api.content = function(args) {
		var usage = { 'reddit-requests': 0 };
		return new Promise(function(resolve, reject) {
			console.log('ok');
			model.article_comments(_.pick(args, 'id'), null, usage, function(err, comment_tree) {
				console.log('ok...', err, comment_tree);
				if (err) {
					return reject(err);
				}
				resolve(post_to_content(_.chain(comment_tree) .first() .result('data') .result('children') .first() .result('data') .value()));
			});
		});
	};

	api.discussion = function(args, callback) {
		var usage = { 'reddit-requests': 0 };
		async.waterfall([
			function(callback) {
				if (_.chain(args).result('for').isEmpty().value()) {
					return async.setImmediate(function() {
						callback(null, args);
					});
				}
				model.search({
					q: _.chain(urls.represent(args.for))
						.map(function(url) {
							return 'url:"' + (url || '').replace(/^https?:\/\//, '') + '"';
						})
						.join(' OR ')
						.value()
				}, null, usage, function(err, search_results) {
					if (err) {
						return callback(err);
					}
					var pick_for = _.pick(args.for, 'api', 'type', 'id', 'as');
					var content = _.chain(search_results)
						.where({ kind: 't3' })
						.pluck('data')
						.each(function(post) {
							return _.isEqual(urls.parse(post.url), pick_for);
						})
						.max('num_comments')
						.value();
					if (_.isEmpty(content)) {
						return callback('none');
					}
					callback(null, content);
				});
			},
			function(comments_args, callback) {
				model.article_comments(_.pick(comments_args, 'id'), null, usage, callback);
			}
		], function(err, comment_tree) {
			if (err === 'none') {
				return callback(null, { api:      'reddit', type:     'discussion', comments: [] }, usage);
			}
			if (err) {
				return callback(err, null, usage);
			}
			var post = _.chain(comment_tree) .first() .result('data') .result('children') .first() .result('data') .value();
			callback(null, _.pick({ api:      'reddit', type:     'discussion', id:       _.result(post, 'id'), content:  post_to_content(post), comments: _.chain(comment_tree) .last() .result('data') .result('children') .where({ kind: 't1' }) .pluck('data') .map(comment_to_comment) .reject(_.isEmpty) .value() }, _.somePredicate(_.isNumber, _.negate(_.isEmpty))), usage);
		});
	};

	api.account = function(args, callback) {
		var usage = { 'reddit-requests': 0 };
		model.user_about(_.pick(args, 'id'), null, usage, function(err, user) {
			if (err) {
				return callback(err, null, usage);
			}
			callback(null, _.pick({ api:   'reddit', type:  'account', id:    _.result(user, 'name'), date:  Number(_.result(user, 'created_utc')) * 1000, stats: _.pick(user, 'link_karma', 'comment_karma') }, _.somePredicate(_.isNumber, _.negate(_.isEmpty))), usage);
		});
	};

	api.account_content = function(args, callback) {
		var usage = { 'reddit-requests': 0 };
		model.user_overview(_.pick(args, 'id'), null, usage, function(err, things) {
			if (err) {
				return callback(err, null, usage);
			}
			callback(null, _.pick({ api:     'reddit', type:    'account_content', id:      args.id, content: _.chain(things) .map(function(thing) {
			                                     															switch (_.result(thing, 'kind')) {
			                                         															case 't1':
			                                             																														var comment          = _.result(thing, 'data');
			                                             																														var content_id       = _.rest((_.result(comment, 'link_id') || '').split('_')).join('_');
			                                             																														var url              = _.result(comment, 'link_url');
			                                             																														var link_as_identity = url && urls.parse(url);
			                                             																														if (_.isMatch(link_as_identity, { api: 'reddit', type: 'content', id: content_id })) {
			                                                 															url = null; }
			                                             																														return _.chain(comment_to_comment(comment)) .omit('account') .extend({ content: _.pick({ api:       'reddit', type:      'content', id:        content_id, name:      _.result(comment, 'link_title'), subreddit: _.result(comment, 'subreddit'), url:       url, account:   (_.result(comment, 'link_author') !== '[deleted]') && { api:  'reddit', type: 'account', id:   _.result(comment, 'link_author') } }, _.negate(_.isEmpty)) }) .value();
			                                         															case 't3':
			                                             																														var content = _.omit(post_to_content(thing.data), 'account', 'text');
			                                             																														content.stats = _.pick(content.stats, 'score');
			                                             																														return content; } }) .reject(_.isEmpty) .value() }, _.somePredicate(_.isNumber, _.negate(_.isEmpty))), usage);
		});
	};

	model.article_comments = function(args, args_not_cached, usage, callback) {
		callback = _.wrapErrorCallback(callback, 'Reddit Article Comments');

		usage['reddit-requests']++;
		reddit('/comments/$article').get({ $article: _.result(args, 'id'), limit: config.counts.listed }).then(function(comment_tree) {
			async.setImmediate(function() {
				callback(null, comment_tree);
			});
		}, function(err) {
			async.setImmediate(function() {
				switch (err.status) {
					case 404:
					case 429:
						return callback({ status : err.status });
				}
				callback({ status : err.status >= 500 ? 502 : 500, original_status: err.status });
			});
		});
	};

	model.search = function(args, args_not_cached, usage, callback) {
		callback = _.wrapErrorCallback(callback, 'Reddit Search');

		usage['reddit-requests']++;
		reddit('/search').get({ q: _.result(args, 'q'), limit: 25 }).then(function(search_results) {
			async.setImmediate(function() {
				callback(null, _.chain(search_results) .result('data') .result('children') .value());
			});
		}, function(err) {
			async.setImmediate(function() {
				switch (err.status) {
					case 404:
					case 429:
						return callback({ status : err.status });
				}
				callback({ status : err.status >= 500 ? 502 : 500, original_status: err.status });
			});
		});
	};

	model.user_about = function(args, args_not_cached, usage, callback) {
		callback = _.wrapErrorCallback(callback, 'Reddit User About');

		usage['reddit-requests']++;
		reddit('/user/$username/about').get({ $username: _.result(args, 'id') }).then(function(body) {
			async.setImmediate(function() {
				var user = _.result(body, 'data');
				if (!_.isObject(user)) {
					return callback({ status: 404 });
				}
				callback(null, user);
			});
		}, function(err) {
			async.setImmediate(function() {
				switch (err.status) {
					case 404:
					case 429:
						return callback({ status : err.status });
				}
				callback({ status : err.status >= 500 ? 502 : 500, original_status: err.status });
			});
		});
	};

	model.user_overview = function(args, args_not_cached, usage, callback) {
		callback = _.wrapErrorCallback(callback, 'Reddit User Overview');

		usage['reddit-requests']++;
		reddit('/user/$username/overview').get({ $username: _.result(args, 'id'), limit: config.counts.listed }).then(function(body) {
			async.setImmediate(function() {
				var things = _.chain(body).result('data').result('children').value();
				if (!_.isObject(things)) {
					return callback({ status: 404 });
				}
				callback(null, things);
			});
		}, function(err) {
			async.setImmediate(function() {
				switch (err.status) {
					case 404:
					case 429:
						return callback({ status : err.status });
				}
				callback({ status : err.status >= 500 ? 502 : 500, original_status: err.status });
			});
		});
	};

	return api;
};
