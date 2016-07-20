var _          = require('underscore');
var Autolinker = require( 'autolinker' );
var config     = require('../config');
var request    = require('request');
var urls       = require('../urls');
require('../common/mixins');

module.exports = function(params) {
	var model = {};
	var api   = { model: model };

	var autolinker = new Autolinker();

	function imgur(endpoint, usage, use_mashape, callback) {
		usage[use_mashape ? 'mashape-requests' : 'imgur-requests']++;
		request({ url:     (use_mashape ? 'https://imgur-apiv3.p.mashape.com' : 'https://api.imgur.com') + '/3' + endpoint + '.json', headers: _.extend({ authorization: 'Client-ID ' + params.key }, use_mashape && { 'x-mashape-key': params.mashape_key }), json:    true }, function(err, response) {
			if (err) {
				return callback(_.defaults(err, { status: 500 }));
			}
			if (_.result(response, 'statusCode') >= 400) {
				switch (response.statusCode) {
					case 404:
					case 429:
						return callback({ status: response.statusCode });
					case 503:
						if (use_mashape) {
							return imgur(endpoint, usage, false, callback);
						}
						/* falls through */
					default:
						return callback({ status: (response.statusCode >= 500) ? 502 : 500, original_status: response.statusCode });
				}
			}
			callback(null, _.chain(response) .result('body') .result('data') .value());
		});
	}

	function image_or_album_to_content(image_or_album, as) {
		var is_album = _.result(image_or_album, 'is_album', as === 'album');
		var score    = _.result(image_or_album, 'score');
		return !_.isEmpty(image_or_album) && _.pick({ api:   'imgur', type:  'content', id:    _.result(image_or_album, 'id'), as:    is_album ? 'album' : 'image', name:  _.result(image_or_album, 'title'), text:  autolinker.link((_.result(image_or_album, 'description') || '') .replace(/\n+$/, '') .replace(/\n/g, '<br>')), date:  _.result(image_or_album, 'datetime') * 1000, image: { small:  'http://i.imgur.com/' + _.result(image_or_album, is_album ? 'cover' : 'id') + 's.jpg', medium: 'http://i.imgur.com/' + _.result(image_or_album, is_album ? 'cover' : 'id') + 'm.jpg', large:  'http://i.imgur.com/' + _.result(image_or_album, is_album ? 'cover' : 'id') + 'l.jpg' }, gif:   _.result(image_or_album, 'animated') && (_.result(image_or_album, 'type') === 'image/gif') && _.result(image_or_album, 'mp4'), stats: _.pick({ views: Number(_.result(image_or_album, 'views')), score: _.isNumber(score) && Number(score) }, _.isNumber) }, _.somePredicate(_.isNumber, _.negate(_.isEmpty)));
	}

	api.content = function(args, callback) {
		var usage = { 'mashape-requests': 0, 'imgur-requests': 0 };
		model[_.result(args, 'as')](_.pick(args, 'id'), null, usage, function(err, image_or_album) {
			if (err) {
				return callback(err, null, usage);
			}

			var account_url = _.result(image_or_album, 'account_url');
			callback(null, _.chain(image_or_album_to_content(image_or_album, _.result(args, 'as'))) .extend({ account:     !_.isEmpty(account_url) && { api:  'imgur', type: 'account', id:   account_url }, content:     _.chain(image_or_album) .result('images') .map(image_or_album_to_content) .reject(_.isEmpty) .value(), discussions: !_.result(image_or_album, 'score') && [{ api:           'imgur', type:          'discussion', id:            _.result(image_or_album, 'id'), uncommentable: true }] }) .pick(_.somePredicate(_.isNumber, _.negate(_.isEmpty))) .value(), usage);
		});
	};

	api.discussion = function(args, callback) {
		var usage = { 'mashape-requests': 0, 'imgur-requests': 0 };
		model.gallery_comments(_.pick(args, 'id'), null, usage, function(err, comments) {
			if (err) {
				return callback(err, null, usage);
			}

			callback(null, _.pick({ api:      'imgur', type:     'discussion', id:       args.id, comments: (function comments_to_comments(comments, next_points) {
			                                      												return _.chain(comments) .reject(_.isEmpty) .first(config.counts.listed) .reject(function(comment) { return _.result(comment, 'points') < next_points / 2.0; }) .map(function(comment, i, comments) {
			                                                  												var author = _.result(comment, 'author');
			                                                  												return _.pick({ api:     'imgur', type:    'comment', id:      _.result(comment, 'id'), text:    autolinker.link((_.result(comment, 'comment') || '') .replace(/\n+$/, '') .replace(/\n/g, '<br>')), date:    _.result(comment, 'datetime') * 1000, stats:   { score: _.result(comment, 'points') }, account: !_.isEmpty(author) && { api: 'imgur', type: 'account', id: author }, replies: comments_to_comments(_.result(comment, 'children'), _.max([_.result(comments[i + 1], 'points'), next_points])) }, _.somePredicate(_.isNumber, _.negate(_.isEmpty))); }) .value(); }(comments, -Infinity)) }, _.negate(_.isEmpty)), usage);
		});
	};

	api.account = function(args, callback) {
		var usage = { 'mashape-requests': 0, 'imgur-requests': 0 };
		model.account(_.pick(args, 'id'), null, usage, function(err, account) {
			if (err) {
				return callback(err, null, usage);
			}
			var text = autolinker.link((_.result(account, 'bio') || '') .replace(/\n+$/, '') .replace(/\n/g, '<br>'));

			callback(null, _.pick({ api:      'imgur', type:     'account', id:       _.result(account, 'url'), text:     text, date:     _.result(account, 'created') * 1000, stats:    { score: Number(_.result(account, 'reputation')) }, accounts: _.chain(text.match(/href="[^"]+"/g)) .invoke('slice', 6, -1) .map(urls.parse) .where({ type: 'account' }) .uniq(false, function(account) { return account.api + '/' + account.id + '/' + account.as; }) .value() }, _.somePredicate(_.isNumber, _.negate(_.isEmpty))), usage);
		});
	};

	api.account_content = function(args, callback) {
		var usage = { 'mashape-requests': 0, 'imgur-requests': 0 };
		model.account_submissions(_.pick(args, 'id'), null, usage, function(err, submissions) {
			if (err) {
				return callback(err, null, usage);
			}

			callback(null, _.pick({ api:     'imgur', type:    'account_content', id:      args.id, content: _.chain(submissions) .map(function(submission) {
			                                      												return _.pick(image_or_album_to_content(submission), 'api', 'type', 'id', 'as', 'name', 'image', 'gif'); }) .reject(_.isEmpty) .first(config.counts.grid) .value() }, _.somePredicate(_.isNumber, _.negate(_.isEmpty))), usage);
		});
	};

	model.account = function(args, args_not_cached, usage, callback) {
		callback = _.wrapErrorCallback(callback, 'Imgur Account');

		imgur('/account/' + _.result(args, 'id'), usage, params.mashape_key, callback);
	};

	model.account_submissions = function(args, args_not_cached, usage, callback) {
		callback = _.wrapErrorCallback(callback, 'Imgur Account Submissions');

		imgur('/account/' + _.result(args, 'id') + '/submissions/0', usage, params.mashape_key, callback);
	};

	model.album = function(args, args_not_cached, usage, callback) {
		model.gallery(args, args_not_cached, usage, function(err, gallery_item) {
			if (!err || err.status !== 404) {
				return callback(err, gallery_item);
			}
			callback = _.wrapErrorCallback(callback, 'Imgur Album');

			imgur('/album/' + _.result(args, 'id'), usage, params.mashape_key, callback);
		});
	};

	model.gallery = function(args, args_not_cached, usage, callback) {
		callback = _.wrapErrorCallback(callback, 'Imgur Gallery');

		imgur('/gallery/' + _.result(args, 'id'), usage, params.mashape_key, callback);
	};

	model.gallery_comments = function(args, args_not_cached, usage, callback) {
		callback = _.wrapErrorCallback(callback, 'Imgur Gallery Comments');

		imgur('/gallery/' + _.result(args, 'id') + '/comments', usage, params.mashape_key, callback);
	};

	model.image = function(args, args_not_cached, usage, callback) {
		model.gallery(args, args_not_cached, usage, function(err, gallery_item) {
			if (!err || err.status !== 404) {
				return callback(err, gallery_item);
			}

			imgur('/image/' + _.result(args, 'id'), usage, params.mashape_key, function(err, image) {
				if (_.result(args_not_cached, 'keep_suffix') || !(_.result(args, 'id') || '').match(/.*[sbtmlh]$/) || !err || err.status !== 404) {
					return _.wrapErrorCallback(callback, 'Imgur Image')(err, image);
				}
				model.image(_.defaults({ id: _.result(args, 'id').slice(0, -1) }, args), _.defaults({ keep_suffix: true }, args_not_cached), usage, callback);
			});
		});
	};

	return api;
};
