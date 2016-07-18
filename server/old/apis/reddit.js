/* eslint-disable */
var _        = require('underscore');
var Snoocore = require('snoocore');
var URI      = require('urijs/src/URI');
var async    = require('async');

var network_urls = require('./network-urls');

module.exports = function(params) {
	var methods = {};

	var reddit = new Snoocore({ userAgent:          'node:HoverCards:v1 (by /u/HoverCards)',
	                            decodeHtmlEntities: true,
	                            throttle:           0,
	                            retryDelay:         params.no_delay ? 0 : 5000,
	                            retryAttempts:      2,
	                            oauth:              { type:        'implicit',
	                                                  key:         params.key,
	                                                  redirectUri: 'http://localhost:8000',
	                                                  scope:       ['read', 'history'],
	                                                  deviceId:    params.device_id || 'DO_NOT_TRACK_THIS_DEVICE' } });

	/*
	 * Main Methods
	 */

	methods.content = function(args, callback) {
		if (!_.isObject(args)) {
			return callback({ status: 400 });
		}
		methods.__thread({ $thread: args.id }, null, function(err, body) {
			if (err) {
				return callback(err);
			}
			var thread = body[0];
			var media       = _.result(thread.media, 'oembed');
			var description = (thread.selftext_html || '')
			                  .replace(/\n/gi, '')
			                  .replace(/<!-- .*? -->/gi, '')
			                  .replace(/^\s*<div class="md">(.*?)<\/div>\s*$/, '$1')
			                  .replace(/<a href="\/([^"]*?)">(.*?)<\/a>/gi, '<a href="https://www.reddit.com/$1">$2</a>')
			                  .replace(/<p>(.*?)<\/p>/gi, '$1<br>')
			                  .replace(/<br>$/i, '');
			callback(null, _.chain(thread)
			                .pick('id', 'subreddit', 'score')
			                .extend({ api:         'reddit',
			                          type:        'content',
			                          name:        thread.title,
			                          description: description,
			                          date:        thread.created_utc * 1000,
			                          up_ratio:    thread.upvote_ratio,
			                          embed:       _.isObject(media) && (media.html || '').replace(/\s*(?:frameborder|height|width)="\d+"/g, '').replace(/src="\/\//, 'src="https://'),
			                          image:       (_.isObject(media) && media.thumbnail_url) ||
			                                       (thread.thumbnail && thread.thumbnail !== 'self' && _.chain(thread.preview)
			                                                                                            .result('images')
			                                                                                            .first()
			                                                                                            .result('source')
			                                                                                            .result('url')
			                                                                                            .value() ),
			                          author:      (thread.author && thread.author !== '[deleted]') ? { api: 'reddit', type: 'account', id: thread.author } : null,
			                          accounts:    _.chain((thread.author && thread.author !== '[deleted]') ? [{ api: 'reddit', type: 'account', id: thread.author, reason: 'author' }] : [])
			                                        .union(_.chain(description.match(/href="([^"]+?)"/g))
			                                                .invoke('replace', /href="([^"]+?)"/, '$1')
			                                                .map(network_urls.identify)
			                                                .where({ type: 'account' })
			                                                .each(function(account) { account.reason = 'mention'; })
			                                                .value())
			                                        .uniq(false, function(account) { return account.api + '/' + account.id + '/' + account.as; })
			                                        .value() })
			                .value());
		});
	};

	methods.discussion = function(args, callback) {
		if (!_.isObject(args)) {
			return callback({ status: 400 });
		}
		async.waterfall([
			function(callback) {
				if (!args.for) {
					return callback(!args.id && { status: 404 }, args.id);
				}
				methods.__thread_id_for_content(args.for, null, callback);
			},
			function(thread_id, callback) {
				var comments_request = { $thread: thread_id };
				if (_.result(args.focus, 'id')) {
					comments_request.comment = args.focus.id;
					comments_request.context = 1;
				}
				methods.__thread(comments_request, null, function(err, body) {
					if (err) {
						return callback(err);
					}
					var thread = body[0];

					var content;
					if (thread.url) {
						var thing = network_urls.identify(thread.url);
						if (_.result(thing, 'type') === 'content') {
							content = thing;
						}
					}

					callback(null, _.chain(thread)
					                .pick('id', 'subreddit', 'score')
					                .extend({ api:      'reddit',
					                          type:     'discussion',
					                          name:     thread.title,
					                          focus:    _.result(args.focus, 'id') && { id: args.focus.id },
					                          date:     thread.created_utc * 1000,
					                          count:    body[1].length ? thread.num_comments : 0,
					                          author:   (thread.author && thread.author !== '[deleted]') ? { api: 'reddit', type: 'account', id: thread.author } : null,
					                          comments: body[1],
					                          content:  content || { api: 'reddit', type: 'content', id: thread.id },
					                          accounts: (thread.author && thread.author !== '[deleted]') ? [{ api: 'reddit', type: 'account', id: thread.author, reason: 'author' }] : [] })
					                .value());
				});
			}
		], callback);
	};

	methods.account = function(args, callback) {
		if (!_.isObject(args)) {
			return callback({ status: 400 });
		}
		methods.__account({ id : args.id }, {}, callback);
	};

	methods.more_content = function(args, callback) {
		if (!_.isObject(args)) {
			return callback({ status: 400 });
		}
		methods.__more_content({ id : args.id }, {}, callback);
	};

	methods.url = function(args, callback) {
		if (!_.isObject(args)) {
			return callback({ status: 400 });
		}
		methods.discussion({ for: { id: args.id, type: 'url' } }, callback);
	};

	methods.query = function(args) {
		if (!_.isObject(args)) {
			return null;
		}
		switch (_.result(args, 'type')) {
			case 'url':
				var url = (URI(args.id || '').toString() || '').replace(/^https?:\/\//, '').replace(/^www\./, '');
				return { q: 'url:"' + url + '"', url: args.id, limit: 100 };
			case 'content':
				switch (_.result(args, 'api')) {
					case 'imgur':
						return { q: 'site:imgur.com AND url:' + args.id, exact_matches: [args.id] };
					case 'instagram':
						return { q: '(site:instagram.com OR site:instagr.am) AND url:p/' + args.id };
					case 'soundcloud':
						return { q: 'site:soundcloud.com AND url:' + _.result(args.author, 'id') + (args.as === 'playlist' ? '/sets' : '') + '/' + args.id };
					case 'twitter':
						return { q: 'site:twitter.com AND url:' + args.id };
					case 'youtube':
						return { q: '(site:youtube.com OR site:youtu.be) AND (url:3D' + args.id + ' OR url:' + (args.id || '').replace(/^-+/, '') + ')' };
				}
				break;
		}
	};

	/*
	 * Cacheable Methods
	 */

	methods.__thread = function(args, more_args, callback) {
		reddit('/comments/$thread').get(_.extend({ limit: 10 }, args)).then(function(body) {
			if (!_.isArray(body)) {
				return callback({ status: 404 });
			}
			var thread = _.chain(body[0]).result('data').result('children').first().result('data').value();
			if (!_.isObject(thread)) {
				return callback({ status: 404 });
			}
			callback(null, [thread, (function get_comments(listing) {
				if (!_.isObject(listing) || _.result(listing, 'kind') !== 'Listing') {
					return [];
				}
				return _.chain(listing)
				        .result('data')
				        .result('children')
				        .where({ kind: 't1' })
				        .pluck('data')
				        .filter(_.isObject)
				        .map(function(child) {
				            return _.chain(child)
				                    .pick('id', 'score')
				                    .extend({ description: (child.body_html || '')
				                                           .replace(/\n/gi, '')
				                                           .replace(/<!-- .*? -->/gi, '')
				                                           .replace(/^\s*<div class="md">(.*?)<\/div>\s*$/, '$1')
				                                           .replace(/<a href="\/([^"]*?)">(.*?)<\/a>/gi, '<a href="https://www.reddit.com/$1">$2</a>')
				                                           .replace(/<p>(.*?)<\/p>/gi, '$1<br>')
				                                           .replace(/<br>$/i, ''),
				                              date:        child.created_utc * 1000,
				                              author:      (child.author && child.author !== '[deleted]') ? { api: 'reddit', type: 'account', id: child.author } : null,
				                              comments:    get_comments(child.replies) })
				                    .value();
				        })
				        .value();
			}(body[1]))]);
		}, function(err) {
			switch (err.status) {
				case 404:
				case 429:
					return callback({ status: err.status});
			}
			callback({ status: (err.status >= 500) ? 502 : 500 });
		});
	};

	methods.__thread_id_for_content = function(args, more_args, callback) {
		var query = methods.query(args);
		if (!_.isObject(query)) {
			return callback({ status: 400 });
		}
		reddit('/search').get({ q: query.q, limit: query.limit || 25 }).then(function(body) {
			var url;
			if (query.url) {
				url = URI(query.url.replace(/www\./, '')).normalize().protocol('https');
			}
			var thread_id = _.chain(body)
			                 .result('data')
			                 .result('children')
			                 .pluck('data')
			                 .reject(function(thread) {
			                     return url && !url.equals(URI(thread.url.replace(/www\./, '')).protocol('https').normalize());
			                 })
			                 .reject(function(thread) {
			                     return query.exact_matches && !_.every(query.exact_matches, function(match) { return thread.url.indexOf(match) !== -1; });
			                 })
			                 .max(_.partial(_.result, _, 'num_comments', 0))
			                 .result('id')
			                 .value();
			callback(!thread_id && { status: 404 }, thread_id);
		}, function(err) {
			switch (err.status) {
				case 400:
				case 404:
				case 429:
					return callback({ status: err.status });
			}
			callback({ status: (err.status >= 500) ? 502 : 500 });
		});
	};

	methods.__account = function(args, more_args, callback) {
		reddit('/user/$username/about').get({ $username: args.id }).then(function(body) {
			var data = _.result(body, 'data');
			if (!_.isObject(data)) {
				return callback({ status: 404 });
			}
			callback(null, _.chain(data)
			                .pick('link_karma', 'comment_karma')
			                .extend({ api:  'reddit',
			                          type: 'account',
			                          id:   data.name,
			                          date: data.created_utc * 1000 })
			                .value());
		}, function(err) {
			switch (err.status) {
				case 404:
				case 429:
					return callback({ status: err.status });
			}
			callback({ status: (err.status >= 500) ? 502 : 500 });
		});
	};

	methods.__more_content = function(args, more_args, callback) {
		reddit('/user/$username/overview').get({ $username: args.id, limit: 10 }).then(function(body) {
			callback(null, { api:     'reddit',
			                 type:    'more_content',
			                 id:      args.id,
			                 content: _.chain(body)
			                           .result('data')
			                           .result('children')
			                           .filter(_.isObject)
			                           .filter(function(child) {
			                               return _.isObject(child.data);
			                           })
			                           .map(function(child) {
			                               switch (child.kind) {
			                                   case 't1':
			                                       return _.chain(child.data)
			                                               .pick('subreddit', 'score')
			                                               .extend({ type:        'comment',
			                                                         description: (child.data.body_html || '')
			                                                                      .replace(/\n/gi, '')
			                                                                      .replace(/<!-- .*? -->/gi, '')
			                                                                      .replace(/^\s*<div class="md">(.*?)<\/div>\s*$/, '$1')
			                                                                      .replace(/<a href="\/([^"]*?)">(.*?)<\/a>/gi, '<a href="https://www.reddit.com/$1">$2</a>')
			                                                                      .replace(/<p>(.*?)<\/p>/gi, '$1<br>')
			                                                                      .replace(/<br>$/i, ''),
			                                                         date:        child.data.created_utc * 1000,
			                                                         content:     { api:       'reddit',
			                                                                        type:      'content',
			                                                                        id:        (child.data.link_id || '').split('_')[1],
			                                                                        subreddit: child.data.subreddit,
			                                                                        name:      child.data.link_title } })
			                                               .value();
			                                   case 't3':
			                                       return _.chain(child.data)
			                                               .pick('id', 'subreddit', 'score')
			                                               .extend({ api:         'reddit',
			                                                         type:        'content',
			                                                         name:        child.data.title,
			                                                         description: (child.data.selftext_html || '')
			                                                                      .replace(/\n/gi, '')
			                                                                      .replace(/<!-- .*? -->/gi, '')
			                                                                      .replace(/^\s*<div class="md">(.*?)<\/div>\s*$/, '$1')
			                                                                      .replace(/<a href="\/([^"]*?)">(.*?)<\/a>/gi, '<a href="https://www.reddit.com/$1">$2</a>')
			                                                                      .replace(/<p>(.*?)<\/p>/gi, '$1<br>')
			                                                                      .replace(/<br>$/i, ''),
			                                                         image:       child.data.thumbnail,
			                                                         date:        child.data.created_utc * 1000 })
			                                               .value();
			                                   default:
			                                       return null;
			                               }
			                           })
			                           .compact()
			                           .value() });
		}, function(err) {
			switch (err.status) {
				case 404:
				case 429:
					return callback({ status: err.status });
			}
			callback({ status: (err.status >= 500) ? 502 : 500 });
		});
	};

	return methods;
};
