/* eslint-disable */
var _              = require('underscore');
var async          = require('async');
var instagram_node = require('instagram-node');

var network_urls = require('./network-urls');

var DEFAULT_PROFILE_IMAGE = 'https://instagramimages-a.akamaihd.net/profiles/anonymousUser.jpg';
var HASHTAG_REGEX         = /#([^\s!"#$%&'()*+,./:;<=>?@\^_`{|}~-]+)/g;
var MENTION_REGEX         = /(^|[^\w])@(\w[\w.]+\w)/g;

if (process.browser) {
	// TODO shim to deal with https://github.com/substack/http-browserify/pull/10
	require('http').request = _.wrap(require('http').request, function(request, params, cb) {
		return request(params, function(res) {
			res.setEncoding = _.noop;
			if (cb) {
				return cb(res);
			}
		});
	});
}

module.exports = function(params) {
	var methods = {};

	var instagram = instagram_node.instagram();

	if (params.key && params.secret) {
		instagram.use({ client_id: params.key, client_secret: params.secret });
	} else if (params.user) {
		instagram.use({ access_token: params.user });
	}

	function handle_err(err, change_404_to_400, callback) {
		err.status = err.status || err.code || err.status_code;
		switch (err.status) {
			case 400:
				switch (err.error_type) {
					case 'APINotAllowedError':
						return callback({ status: 403 });
					case 'APINotFoundError':
						return callback({ status: 404 });
					case 'OAuthAccessTokenException':
						return callback({ status: 401 });
				}
				/* falls through */
			case 404:
				if (change_404_to_400) {
					return callback({ status: 400 });
				}
				/* falls through */
			case 429:
				return callback({ status: err.status });
		}
		callback({ status: (err.status >= 500) ? 502 : 500 });
	}

	/*
	 * Main Methods
	 */

	methods.content = function(args, callback) {
		if (!_.isObject(args)) {
			return callback({ status: 400 });
		}
		methods.__media({ id : args.id }, {}, function(err, post) {
			if (err) {
				return callback(err);
			}
			callback(null, { api:         'instagram',
			                 type:        'content',
			                 id:          post.id,
			                 description: _.chain((_.result(post.caption, 'text') || '').split('#'))
			                               .reduce(function(description, section) {
			                                   var section_lowercase = section.toLowerCase();
			                                   var tag_index = _.findLastIndex(post.tags, function(tag) { return !section_lowercase.indexOf(tag); });
			                                   if (tag_index === -1) {
			                                       return description + '#' + section;
			                                   }
			                                   var tag = post.tags[tag_index];
			                                   return description + '<a href="https://instagram.com/explore/tags/' + tag + '/">#' + section.substring(0, tag.length) + '</a>' + section.substring(tag.length);
			                               })
			                               .value()
			                               .replace(MENTION_REGEX, '$1<a href="https://instagram.com/$2">@$2</a>')
			                               .replace(/\n+$/, '')
			                               .replace(/\n/g, '<br>'),
			                 video:       _.chain(post.videos).result('standard_resolution').result('url').value(),
			                 date:        post.created_time * 1000,
			                 image:       _.chain(post.images).result('standard_resolution').result('url').value(),
			                 likes:       _.result(post.likes, 'count'),
			                 author:      { api: 'instagram', type: 'account', id: _.result(post.user, 'username'), name: _.result(post.user, 'full_name') },
			                 accounts:    _.chain([{ api: 'instagram', type: 'account', id: _.result(post.user, 'username'), reason: 'author' }])
			                               .union(_.map((_.result(post.caption, 'text') || '').match(MENTION_REGEX), function(mention) {
			                                          return { api: 'instagram', type: 'account', id: mention.replace(/^.*@/, ''), reason: 'mention' };
			                                      }),
			                                      _.chain(post.users_in_photo)
			                                       .filter(_.isObject)
			                                       .filter(function(tag) {
			                                           return _.isObject(tag.user);
			                                       })
			                                       .map(function(tag) {
			                                           return { api:      'instagram',
			                                                    type:     'account',
			                                                    id:       tag.user.username,
			                                                    name:     tag.user.full_name,
			                                                    image:    tag.user.profile_picture,
			                                                    position: tag.position,
			                                                    reason:   'tag' };
			                                       })
			                                       .value())
			                               .uniq(false, function(account) { return account.api + '/' + account.id + '/' + account.as; })
			                               .value() });
		});
	};

	methods.discussion = function(args, callback) {
		if (!_.isObject(args)) {
			return callback({ status: 400 });
		}
		methods.__media({ id : args.id }, {}, function(err, post) {
			if (err) {
				return callback(err);
			}
			callback(null, { api:      'instagram',
			                 type:     'discussion',
			                 id:       post.id,
			                 count:    _.result(post.comments, 'count'),
			                 comments: _.chain(post.comments)
			                            .result('data')
			                            .filter(_.isObject)
			                            .filter(function(comment) { return _.isObject(comment.from); })
			                            .reverse()
			                            .map(function(comment) {
			                                return { description: _.chain((comment.text || '').split('#'))
			                                                       .reduce(function(description, section) {
			                                                           var section_lowercase = section.toLowerCase();
			                                                           var tag_index = _.findLastIndex(post.tags, function(tag) { return !section_lowercase.indexOf(tag); });
			                                                           if (tag_index === -1) {
			                                                               return description + '#' + section;
			                                                           }
			                                                           var tag = post.tags[tag_index];
			                                                           return description + '<a href="https://instagram.com/explore/tags/' + tag + '/">#' + section.substring(0, tag.length) + '</a>' + section.substring(tag.length);
			                                                       })
			                                                       .value()
			                                                       .replace(MENTION_REGEX, '$1<a href="https://instagram.com/$2">@$2</a>')
			                                                       .replace(/\n+$/, '')
			                                                       .replace(/\n/g, '<br>'),
			                                         date:        comment.created_time * 1000,
			                                         author:      { api:   'instagram',
			                                                        type:  'account',
			                                                        id:    comment.from.username,
			                                                        name:  comment.from.full_name,
			                                                        image: (comment.from.profile_picture !== DEFAULT_PROFILE_IMAGE) ? comment.from.profile_picture : null } };
			                            })
			                            .value() });
		});
	};

	methods.account = function(args, callback) {
		if (!_.isObject(args) || !_.isString(args.id)) {
			return callback({ status: 400 });
		}
		var id = args.id.toLowerCase();
		async.waterfall([
			async.apply(methods.__user_id_to_username, { id: id }, {}),
			function(user_id, callback) {
				methods.__user({ id: user_id }, {}, function(err, user) {
					if (err) {
						return callback(err);
					}
					var connected_account = network_urls.identify(user.website);
					var is_account        = _.result(connected_account, 'type') === 'account';
					callback(null, { api:         'instagram',
					                 type:        'account',
					                 id:          user.username,
					                 image:       (user.profile_picture !== DEFAULT_PROFILE_IMAGE) ? user.profile_picture : null,
					                 name:        user.full_name,
					                 description: (user.bio || '')
					                              .replace(HASHTAG_REGEX, '<a href="https://instagram.com/explore/tags/$1/">#$1</a>')
					                              .replace(MENTION_REGEX, '$1<a href="https://instagram.com/$2">@$2</a>')
					                              .replace(/\n+$/, '')
					                              .replace(/\n/g, '<br>'),
					                 posts:       _.result(user.counts, 'media'),
					                 following:   _.result(user.counts, 'follows'),
					                 followers:   _.result(user.counts, 'followed_by'),
					                 url_link:    user.website && !is_account && ('<a href="' + user.website + '">' + user.website.replace(/^http:\/\//, '').replace(/^https:\/\//, '').replace(/^www\./, '').replace(/\/$/, '') + '</a>'),
					                 connected:   _.chain(is_account && [connected_account])
					                               .union(_.map((user.bio || '').match(MENTION_REGEX), function(mention) {
					                                   return { api: 'instagram', type: 'account', id: mention.replace(/^.*@/, '') };
					                               }))
					                               .uniq(false, function(account) { return account.api + '/' + account.id + '/' + account.as; })
					                               .value() });
				});
			}
		], callback);
	};

	methods.more_content = function(args, callback) {
		if (!_.isObject(args)) {
			return callback({ status: 400 });
		}
		var id = args.id.toLowerCase();
		async.waterfall([
			async.apply(methods.__user_id_to_username, { id: id }, {}),
			function(user_id, callback) {
				methods.__user_media({ id: user_id }, {}, function(err, posts) {
					if (err) {
						return callback(err);
					}
					callback(null, { api:     'instagram',
					                 type:    'more_content',
					                 id:      args.id,
					                 content: posts });
				});
			}
		], callback);
	};

	/*
	 * Cacheable Methods
	 */

	methods.__media  = function(args, more_args, callback) {
		instagram.media('shortcode/' + args.id, function(err, post) {
			if (err) {
				return handle_err(err, false, callback);
			}
			if (!_.isObject(post)) {
				return callback({ status: 404 });
			}
			callback(null, _.extend(post, { id:   _.result(network_urls.identify(post.link), 'id'),
			                                tags: _.sortBy(post.tags, 'length') }));
		});
	};

	methods.__user_id_to_username = function(args, more_args, callback) {
		instagram.user_search(_.result(args, 'id'), {}, function(err, users) {
			if (err) {
				return handle_err(err, false, callback);
			}
			var user_id = _.chain(users)
			               .find(function(user) { return _.result(args, 'id') === user.username.toLowerCase(); })
			               .result('id')
			               .value();
			callback(!user_id && { status: 404 }, user_id);
		});
	};

	methods.__user = function(args, more_args, callback) {
		instagram.user(args.id, function(err, user) {
			if (err) {
				return handle_err(err, true, callback);
			}
			if (!_.isObject(user)) {
				return callback({ status: 400 });
			}
			callback(null, user);
		});
	};

	methods.__user_media = function(args, more_args, callback) {
		instagram.user_media_recent(args.id, { count: 21 }, function(err, posts) {
			if (err) {
				return handle_err(err, true, callback);
			}
			callback(null,  _.map(posts, function(post) {
			    return _.extend(network_urls.identify(post.link),
			                    { video: _.chain(post.videos).result('standard_resolution').result('url').value(),
			                      image: _.chain(post.images).result('thumbnail').result('url').value() });
			}));
		});
	};

	return methods;
};
