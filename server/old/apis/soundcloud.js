/* eslint-disable */
var _       = require('underscore');
var URI     = require('urijs/src/URI');
var async   = require('async');
var request = require('request');

var network_urls = require('./network-urls');
require('./mixins');

module.exports = function(params) {
	var methods = {};

	function request_endpoint(endpoint, query, callback) {
		request({ url: 'https://api.soundcloud.com' + endpoint + '.json', qs: _.extend({}, query, { client_id: params.key }), json: true }, function(err, response) {
			if (err) {
				return callback(err);
			}
			if (response.statusCode >= 400) {
				return callback({ status: response.statusCode });
			}
			callback(null, response.body);
		});
	}

	/*
	 * Main Methods
	 */

	methods.content = function(args, callback) {
		if (!_.isObject(args)) {
			return callback({ status: 400 });
		}
		var query = { url: network_urls.generate(_.extend({ api: 'soundcloud', type: 'content' }, args)) };
		if (args.as === 'playlist') {
			query.representation = 'compact';
		}
		methods.__resolve(query, null, function(err, data) {
			if (err) {
				return callback(err);
			}
			var username = _.result(data.user, 'permalink');
			callback(null, _.chain({ api:      'soundcloud',
			                         type:     'content',
			                         id:       data.permalink,
			                         as:       data.kind,
			                         name:     data.title,
			                         date:     Date.parse(data.created_at),
			                         image:    (data.artwork_url || (_.result(data.user, 'avatar_url') || '').replace(/^.*\/images\/default_avatar_.*$/, '')).replace(/-large\.([a-z]+)/, '-t300x300.$1'),
			                         author:   username && { api: 'soundcloud', type: 'account', id: username, name: _.result(data.user, 'username') } })
			                .extend(data.kind === 'track' && { description: _.chain(data.description || '')
			                                                                 .urlsToLinks(function(url) {
			                                                                     var identity = network_urls.identify(url);
			                                                                     if (_.result(identity, 'api') === 'soundcloud' && _.result(identity, 'type') === 'account') {
			                                                                         return '<a href="' + network_urls.generate(identity) + '">@' + identity.id + '</a>';
			                                                                     }
			                                                                     var uri = URI(url);
			                                                                     return '<a href="' + uri.protocol(uri.protocol() || 'http') + '">' + url + '</a>';
			                                                                 })
			                                                                 .value()
			                                                                 .replace(/\n+$/, '')
			                                                                 .replace(/\n/g, '<br>'),
			                                                   plays:       data.playback_count,
			                                                   favorites:   data.favoritings_count,
			                                                   comments:    data.comment_count,
			                                                   accounts:    _.chain([])
			                                                                 .union(username && [{ api: 'soundcloud', type: 'account', id: username, reason: 'author' }])
			                                                                 .union(_.chain(data.description || '')
			                                                                         .extractURLs()
			                                                                         .map(network_urls.identify)
			                                                                         .where({ type: 'account' })
			                                                                         .each(function(account) { account.reason = 'mention'; })
			                                                                         .value())
			                                                                 .uniq(false, function(account) { return account.api + '/' + account.id + '/' + account.as; })
			                                                                 .value() })
			                .extend(data.kind === 'playlist' && { tracks:   data.track_count,
			                                                      accounts: _.compact([username && { api: 'soundcloud', type: 'account', id: username, reason: 'author' }]) })
			                .value());
		});
	};

	methods.discussion = function(args, callback) {
		if (!_.isObject(args)) {
			return callback({ status: 400 });
		}
		if (args.as && args.as !== 'track') {
			return callback({ status: 400 });
		}
		async.waterfall([
			function(callback) {
				methods.__resolve({ url: network_urls.generate(_.extend({ api: 'soundcloud', type: 'content' }, args)) }, null, function(err, track) {
					if (err) {
						return callback(err);
					}
					if (!track.commentable) {
						return callback({ status: 403 });
					}
					callback(null, track);
				});
			},
			function(track, callback) {
				var discussion = { api:   'soundcloud',
								   type:  'discussion',
								   id:    track.permalink,
								   count: track.comment_count };
				if (!track.comment_count) {
					return callback(null, _.extend({ comments: [] }, discussion));
				}
				methods.__comments({ id: track.id }, null, function(err, comments) {
					callback(err, _.extend(discussion, { comments: comments }));
				});
			}
		], callback);
	};

	methods.account = function(args, callback) {
		if (!_.isObject(args)) {
			return callback({ status: 400 });
		}
		async.parallel({
			user:         async.apply(methods.__user,         { id : args.id }, {}),
			web_profiles: async.apply(methods.__web_profiles, { id : args.id }, {})
		}, function(err, results) {
			if (err) {
				return callback(err);
			}
			callback(null, _.chain({ api: 'soundcloud', type: 'account' })
			                .extend(results.web_profiles)
			                .extend(results.user)
			                .extend({ connected: _.chain(results.web_profiles.connected)
			                                      .union(results.user.connected)
			                                      .uniq(false, function(account) { return account.api + '/' + account.id + '/' + account.as; })
			                                      .value() })
			                .value());
		});
	};

	methods.more_content = function(args, callback) {
		if (!_.isObject(args)) {
			return callback({ status: 400 });
		}
		async.parallel({
			tracks:    async.apply(methods.__accounts_things, { id: args.id, type: 'tracks' },    _.omit(args, 'id')),
			playlists: async.apply(methods.__accounts_things, { id: args.id, type: 'playlists' }, _.omit(args, 'id'))
		}, function(err, results) {
			if (err) {
				return callback(err);
			}
			callback(null, { api:     'soundcloud',
			                 type:    'more_content',
			                 id:      args.id,
			                 content: _.chain(results.tracks)
			                           .union(results.playlists)
			                           .sortBy(function(thing) { return -thing.date; })
			                           .first(10)
			                           .value() });
		});
	};

	/*
	 * Cacheable Methods
	 */

	methods.__resolve = function(args, more_args, callback) {
		request_endpoint('/resolve', args, function(err, resolved) {
			if (err) {
				switch (err.status) {
					case 400:
					case 403:
					case 404:
					case 429:
						return callback({ status: err.status });
				}
				return callback({ status: (err.status >= 500) ? 502 : 500 });
			}
			if (!_.isObject(resolved)) {
				return callback({ status: 404 });
			}
			callback(null, resolved);
		});
	};

	methods.__comments = function(args, more_args, callback) {
		request_endpoint('/tracks/' + args.id +  '/comments', {}, function(err, comments) {
			if (err) {
				switch (err.status) {
					case 400:
					case 403:
					case 404:
					case 429:
						return callback({ status: err.status });
				}
				return callback({ status: (err.status >= 500) ? 502 : 500 });
			}
			callback(null, _.chain(comments)
			                .filter(_.isObject)
			                .first(10)
			                .map(function(comment) {
			                    return { api:         'soundcloud',
			                             type:        'comment',
			                             id:          comment.id,
			                             description: _.chain(comment.body || '')
			                                           .urlsToLinks(function(url) {
			                                               var identity = network_urls.identify(url);
			                                               if (_.result(identity, 'api') === 'soundcloud' && _.result(identity, 'type') === 'account') {
			                                                   return '<a href="' + network_urls.generate(identity) + '">@' + identity.id + '</a>';
			                                               }
			                                               var uri = URI(url);
			                                               return '<a href="' + uri.protocol(uri.protocol() || 'http') + '">' + url + '</a>';
			                                           })
			                                           .value()
			                                           .replace(/\n+$/, '')
			                                           .replace(/\n/g, '<br>'),
			                             date:        Date.parse(comment.created_at),
			                             track_time:  comment.timestamp,
			                             author:      _.isObject(comment.user) && { api:   'soundcloud',
			                                                                        type:  'account',
			                                                                        id:    comment.user.permalink,
			                                                                        name:  comment.user.username,
			                                                                        image: (comment.user.avatar_url || '').replace(/^.*\/images\/default_avatar_.*$/, '') } };
			                })
			                .value());
		});
	};

	methods.__user = function(args, more_args, callback) {
		request_endpoint('/users/' + args.id, {}, function(err, data) {
			if (err) {
				switch (err.status) {
					case 400:
					case 403:
					case 404:
					case 429:
						return callback({ status: err.status });
				}
				return callback({ status: (err.status >= 500) ? 502 : 500 });
			}
			if (!_.isObject(data)) {
				return callback({ status: 404 });
			}
			callback(null, { id:          data.permalink,
			                 image:       (data.avatar_url || '').replace(/^.*\/images\/default_avatar_.*$/, '').replace(/-large\.([a-z]+)/, '-t300x300.$1') || null,
			                 name:        data.username || data.full_name,
			                 description: _.chain(data.description || '')
			                               .urlsToLinks(function(url) {
			                                   var identity = network_urls.identify(url);
			                                   if (_.result(identity, 'api') === 'soundcloud' && _.result(identity, 'type') === 'account') {
			                                       return '<a href="' + network_urls.generate(identity) + '">@' + identity.id + '</a>';
			                                   }
			                                   var uri = URI(url);
			                                   return '<a href="' + uri.protocol(uri.protocol() || 'http') + '">' + url + '</a>';
			                               })
			                               .value()
			                               .replace(/\n+$/, '')
			                               .replace(/\n/g, '<br>'),
			                 location:    _.chain([data.city, data.country]).compact().join(', ').value(),
			                 tracks:      data.track_count,
			                 playlists:   data.playlist_count,
			                 followers:   data.followers_count,
			                 following:   data.followings_count,
			                 url_link:    data.website && ('<a href="' + data.website + '">' + (data.website_title || data.website) + '</a>'),
			                 connected:   _.chain(data.description || '')
			                               .extractURLs()
			                               .map(network_urls.identify)
			                               .where({ type: 'account' })
			                               .value() });
		});
	};

	methods.__web_profiles = function(args, more_args, callback) {
		request_endpoint('/users/' + args.id + '/web-profiles', {}, function(err, data) {
			if (!_.isArray(data)) {
				return callback(null, []);
			}
			var website = _.find(data, function(link) { return _.result(network_urls.identify(link.url), 'type') !== 'account'; });
			callback(null, { website:   website && ('<a href="' + website.url + '">' + (website.title || website.url) + '</a>'),
			                 connected: _.chain(data)
			                             .pluck('url')
			                             .map(network_urls.identify)
			                             .where({ type: 'account' })
			                             .uniq(false, function(account) { return account.api + '/' + account.id + '/' + account.as; })
			                             .value() });
		});
	};

	methods.__accounts_things = function(args, more_args, callback) {
		request_endpoint('/users/' + args.id + '/' + args.type, {}, function(err, data) {
			if (err) {
				switch (err.status) {
					case 400:
					case 403:
					case 404:
					case 429:
						return callback({ status: err.status });
				}
				return callback({ status: (err.status >= 500) ? 502 : 500 });
			}
			if (!_.isArray(data)) {
				return callback({ status: 404 });
			}
			callback(null, _.chain(data)
			                .filter(_.isObject)
			                .sortBy(function(thing) {
			                    return -Date.parse(thing.created_at);
			                })
			                .first(10)
			                .map(function(thing) {
			                    var username = _.result(thing.user, 'permalink');
			                    return _.chain({ api:    'soundcloud',
			                                     type:   'content',
			                                     id:     thing.permalink,
			                                     as:     thing.kind,
			                                     name:   thing.title,
			                                     date:   Date.parse(thing.created_at),
			                                     image:  thing.artwork_url || _.chain(thing.tracks).first().result('artwork_url').value() || (_.result(thing.user, 'avatar_url') || '').replace(/^.*\/images\/default_avatar_.*$/, ''),
			                                     author: username && { api: 'soundcloud', type: 'account', id: username  } })
			                            .extend(thing.kind === 'track' && { plays:     thing.playback_count,
			                                                                favorites: thing.favoritings_count,
			                                                                comments:  thing.comment_count })
			                            .extend(thing.kind === 'playlist' && { tracks: thing.track_count })
			                            .value();
			                })
			                .value());
		});
	};

	return methods;
};
