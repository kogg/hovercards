/* eslint-disable */
var _       = require('underscore');
var async   = require('async');
var request = require('request');

var network_urls = require('./network-urls');
require('./mixins');

module.exports = function(params) {
	var methods = {};

	var base_url = 'https://api.imgur.com/3';
	var headers  = { authorization: 'Client-ID ' + params.key };
	if (params.mashape_key) {
		base_url = 'https://imgur-apiv3.p.mashape.com/3';
		headers['x-mashape-key'] = params.mashape_key;
	}

	function request_endpoint(endpoint, callback) {
		request({ url: base_url + endpoint + '.json', headers: headers, json: true }, function(err, response) {
			if (err) {
				return callback(err);
			}
			if (response.statusCode >= 502) {
				return callback({ status: response.statusCode });
			}
			var data = _.result(response.body, 'data');
			if (_.result(response.body, 'status') >= 400) {
				return callback({ status: _.result(response.body, 'status'), message: _.result(data, 'error') });
			}
			callback(null, data);
		});
	}

	/*
	 * Main Methods
	 */

	methods.content = function(args, callback) {
		if (!_.isObject(args)) {
			return callback({ status: 400 });
		}
		var i = -1;
		async.retry((args.as || 'gallery') === 'gallery' ? 1 : 2, function(callback) {
			i++;
			if (i === 0) {
				return methods.__post({ as: 'gallery', id: args.id }, null, function(err, content) {
					if (err) {
						return callback(err);
					}
					switch (args.as) {
						case 'album':
							if (!content.is_album) {
								return callback({ status: 404 });
							}
							break;
						case 'image':
							if (content.is_album) {
								return callback({ status: 404 });
							}
							break;
					}
					callback(null, content);
				});
			}
			methods.__post({ as: args.as, id: args.id }, null, callback);
		}, function(err, content) {
			if (err) {
				if (err.status === 404) {
					var possible_id = (args.id || '').replace(/[sbtmlh]$/, '');
					if (possible_id !== args.id && possible_id.length) {
						return methods.content(_.extend({}, args, { id: possible_id }), callback);
					}
				}
				return callback(err);
			}
			callback(null, _.omit(content, 'comment_count'));
		});
	};

	methods.discussion = function(args, callback) {
		if (!_.isObject(args) || (args.as && args.as !== 'gallery')) {
			return callback({ status: 400 });
		}
		async.parallel({
			comments: async.apply(methods.__comments, { id: args.id }, {}),
			commentCount: function(callback) {
				methods.__post({ as: 'gallery', id: args.id }, null, function(err, post) {
					callback(null, _.result(post, 'comment_count'));
				});
			}
		}, function(err, results) {
			if (err) {
				return callback(err);
			}
			var response = { api:      'imgur',
			                 type:     'discussion',
			                 id:       args.id,
			                 comments: results.comments };
			if (results.commentCount >= 0) {
				response.count = results.commentCount;
			}
			callback(null, response);
		});
	};

	methods.account = function(args, callback) {
		if (!_.isObject(args)) {
			return callback({ status: 400 });
		}
		methods.__account({ id: args.id }, null, callback);
	};

	methods.more_content = function(args, callback) {
		if (!_.isObject(args)) {
			return callback({ status: 400 });
		}
		methods.__more_content({ id: args.id }, null, callback);
	};

	/*
	 * Cacheable Methods
	 */

	methods.__post = function(args, more_args, callback) {
		request_endpoint('/' + args.as + '/' + args.id, function(err, data) {
			if (err) {
				switch (err.status) {
					case 400:
					case 404:
					case 429:
						return callback({ status: err.status });
				}
				return callback({ status: (err.status >= 500) ? 502 : 500 });
			}
			if (!_.isObject(data)) {
				return callback({ status: 404 });
			}
			var content = _.chain(data)
						   .pick('id', 'score', 'views', 'is_album', 'comment_count')
						   .extend(args.as === 'album' && { is_album: true })
						   .extend({ api:         'imgur',
						             type:        'content',
						             as:          args.as,
						             name:        data.title,
						             description: _.chain(data.description || '')
						                           .urlsToLinks()
						                           .value()
						                           .replace(/\n+$/, '')
						                           .replace(/\n/g, '<br>'),
						             date:        data.datetime * 1000,
						             author:      data.account_url && { api: 'imgur', type: 'account', id: data.account_url },
						             accounts:    _.chain([])
						                           .union(data.account_url && [{ api: 'imgur', type: 'account', id: data.account_url, reason: 'author' }])
						                           .union(_.chain(data.description || '')
						                                   .extractURLs()
						                                   .map(network_urls.identify)
						                                   .where({ type: 'account' })
						                                   .each(function(account) { account.reason = 'mention'; })
						                                   .value())
						                           .uniq(false, function(account) { return account.api + '/' + account.id + '/' + account.as; })
						                           .value() })
						   .value();
			if (content.is_album) {
				content.images = _.chain(data)
				                  .result('images')
				                  .filter(_.isObject)
				                  .map(function(image) {
				                      return _.chain(image)
				                              .pick('id', 'views')
				                              .extend({ api:         'imgur',
				                                        type:        'content',
				                                        as:          'image',
				                                        description: _.chain(image.description || '')
				                                                      .urlsToLinks()
				                                                      .value()
				                                                      .replace(/\n+$/, '')
				                                                      .replace(/\n/g, '<br>'),
				                                        name:        image.title,
				                                        date:        image.datetime * 1000,
				                                        image:       'http://i.imgur.com/' + image.id + '.jpg',
				                                        filesize:    image.size })
				                              .extend(image.mp4 && { image:          'http://i.imgur.com/' + image.id + 'm.jpg',
				                                                     video:          image.mp4,
				                                                     video_is_image: true })
				                              .value();
				                  })
				                  .value();
			} else {
				_.extend(content, { image: 'http://i.imgur.com/' + data.id + '.jpg', filesize: data.size });
				if (data.mp4) {
					_.extend(content, { image:          'http://i.imgur.com/' + data.id + 'm.jpg',
					                    video:          data.mp4,
					                    video_is_image: true });
				}
			}
			callback(err, content);
		});
	};

	methods.__comments = function(args, more_args, callback) {
		request_endpoint('/gallery/' + args.id + '/comments', function(err, data) {
			if (err) {
				switch (err.status) {
					case 400:
					case 404:
					case 429:
						return callback({ status: err.status });
				}
				return callback({ status: (err.status >= 500) ? 502 : 500 });
			}
			if (!_.isArray(data)) {
				return callback({ status: 404 });
			}
			var remaining = 10;
			callback(null, _.chain(data)
			                .filter(_.isObject)
			                .first(remaining)
			                // Making a filter function that uses the bigger of the current score_to_beat and whatever the score of the next post is
			                // It does this recursively
			                .filter((function make_threaded_filter_comment(score_to_beat) {
			                    return function threaded_filter_comment(comment, i, comments) {
			                        if (!remaining || (comment.points || 0) < score_to_beat) {
			                            return false;
			                        }
			                        remaining--;
			                        _.extend(comment, { children: _.chain(comment.children)
			                                                       .filter(_.isObject)
			                                                       .first(10)
			                                                       .filter(make_threaded_filter_comment(_.max([_.result(comments[i + 1], 'points', -Infinity), score_to_beat])))
			                                                       .value() });
			                        return true;
			                    };
			                })(-Infinity))
			                .map(function map_comment(comment) {
			                    return { api:         'imgur',
			                             type:        'comment',
			                             id:          comment.id,
			                             description: _.chain(comment.comment || '')
			                                           .urlsToLinks()
			                                           .value()
			                                           .replace(/\n+$/, '')
			                                           .replace(/\n/g, '<br>'),
			                             date:        comment.datetime * 1000,
			                             score:       comment.points,
			                             author:      { api:  'imgur',
			                                            type: 'account',
			                                            id:   comment.author },
			                             comments:    _.map(comment.children, map_comment) };
			                })
			                .value());
		});
	};

	methods.__account = function(args, more_args, callback) {
		request_endpoint('/account/' + args.id, function(err, data) {
			if (err) {
				switch (err.status) {
					case 400:
					case 404:
					case 429:
						return callback({ status: err.status });
				}
				return callback({ status: (err.status >= 500) ? 502 : 500 });
			}
			if (!_.isObject(data)) {
				return callback({ status: 404 });
			}
			callback(null, { api:         'imgur',
			                 type:        'account',
			                 id:          data.url,
			                 date:        data.created * 1000,
			                 description: _.chain(data.bio || '')
			                               .urlsToLinks()
			                               .value()
			                               .replace(/\n+$/, '')
			                               .replace(/\n/g, '<br>'),
			                 reputation:  data.reputation,
			                 connected:   _.chain(data.bio)
			                               .extractURLs()
			                               .map(network_urls.identify)
			                               .where({ type: 'account' })
			                               .uniq(false, function(account) { return account.api + '/' + account.id + '/' + account.as; })
			                               .value() });
		});
	};

	methods.__more_content = function(args, more_args, callback) {
		request_endpoint('/account/' + args.id + '/submissions/0', function(err, data) {
			if (err) {
				switch (_.result(err, 'status')) {
					case 400:
					case 404:
					case 429:
						return callback({ status: _.result(err, 'status') });
				}
				return callback({ status: (err.status >= 500) ? 502 : 500 });
			}
			if (!_.isObject(data)) {
				return callback({ status: 404 });
			}
			callback(null, { api:     'imgur',
			                 type:    'more_content',
			                 id:      args.id,
			                 content: _.chain(data)
			                           .filter(_.isObject)
			                           .first(21)
			                           .map(function(submission) {
			                               return { api:   'imgur',
			                                        type:  'content',
			                                        id:    submission.id,
			                                        as:    'gallery',
			                                        image: 'http://i.imgur.com/' + (submission.is_album ? submission.cover : submission.id) + 's.jpg' };
			                           })
			                           .value() });
		});
	};

	return methods;
};
