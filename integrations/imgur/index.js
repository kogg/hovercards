var _          = require('underscore');
var Autolinker = require('autolinker');
var errors     = require('feathers-errors');
var promisify  = require('es6-promisify');
var request    = require('request');

var config = require('../config');
var urls   = require('../urls');
require('../mixins');

var autolinker = new Autolinker();

module.exports = function(params) {
	var model = {};
	var api   = { model: model };

	api.content = function(args) {
		var usage = { 'mashape-requests': 0, 'imgur-requests': 0 };

		var as = _.result(args, 'as');

		if (!as || !_.contains(['gallery', 'image', 'album'], as)) {
			as = 'gallery';
		}

		return model[as](_.pick(args, 'id'), null, usage)
			.then(function(image_or_album) {
				var account_url = _.result(image_or_album, 'account_url');

				return _.pick(
					Object.assign(
						image_or_album_to_content(image_or_album, _.result(args, 'as')),
						{
							account: !_.isEmpty(account_url) && { api: 'imgur', type: 'account', id: account_url },
							content: _.chain(image_or_album)
								.result('images')
								.map(image_or_album_to_content)
								.reject(_.isEmpty)
								.value(),
							discussions: !_.result(image_or_album, 'score') && [{
								api:           'imgur',
								type:          'discussion',
								id:            _.result(image_or_album, 'id'),
								uncommentable: true
							}]
						}
					),
					_.somePredicate(_.isNumber, _.negate(_.isEmpty))
				);
			});
	};

	api.discussion = function(args) {
		var usage = { 'mashape-requests': 0, 'imgur-requests': 0 };

		return model.gallery_comments(_.pick(args, 'id'), null, usage)
			.then(function(comments) {
				return _.pick(
					{
						api:      'imgur',
						type:     'discussion',
						id:       args.id,
						comments: (function comments_to_comments(comments, next_points) {
							return _.chain(comments)
								.reject(_.isEmpty)
								.first(config.counts.listed)
								.reject(function(comment) {
									return _.result(comment, 'points') < next_points / 2.0;
								})
								.map(function(comment, i, comments) {
									var author = _.result(comment, 'author');
									return _.pick(
										{
											api:     'imgur',
											type:    'comment',
											id:      _.result(comment, 'id'),
											text:    autolinker.link((_.result(comment, 'comment') || '').replace(/\n+$/, '').replace(/\n/g, '<br>')),
											date:    _.result(comment, 'datetime') * 1000,
											stats:   { score: _.result(comment, 'points') },
											account: !_.isEmpty(author) && { api: 'imgur', type: 'account', id: author },
											replies: comments_to_comments(
												_.result(comment, 'children'),
												_.max([_.result(comments[i + 1], 'points'), next_points])
											)
										},
										_.somePredicate(_.isNumber, _.negate(_.isEmpty))
									);
								})
								.value();
						})(comments, -Infinity)
					},
					_.negate(_.isEmpty)
				);
			});
	};

	api.account = function(args) {
		var usage = { 'mashape-requests': 0, 'imgur-requests': 0 };

		return model.account(_.pick(args, 'id'), null, usage)
			.then(function(account) {
				var text = autolinker.link((_.result(account, 'bio') || '').replace(/\n+$/, '').replace(/\n/g, '<br>'));

				return _.pick(
					{
						api:      'imgur',
						type:     'account',
						id:       _.result(account, 'url'),
						text:     text,
						date:     _.result(account, 'created') * 1000,
						stats:    { score: Number(_.result(account, 'reputation')) },
						accounts: _.chain(text.match(/href="[^"]+"/g))
							.invoke('slice', 6, -1)
							.map(urls.parse)
							.where({ type: 'account' })
							.uniq(false, function(account) {
								return [account.api, account.id, account.as].join('/');
							})
							.value()
					},
					_.somePredicate(_.isNumber, _.negate(_.isEmpty))
				);
			});
	};

	model.account = function(args, args_not_cached, usage) {
		return imgur('/account/' + _.result(args, 'id'), usage, true);
	};

	model.album = function(args, args_not_cached, usage) {
		return model.gallery(args, args_not_cached, usage)
			.catch(function(err) {
				if (err.code !== 404) {
					throw err;
				}
				return imgur('/album/' + _.result(args, 'id'), usage, true);
			});
	};

	model.gallery = function(args, args_not_cached, usage) {
		return imgur('/gallery/' + _.result(args, 'id'), usage, true);
	};

	model.gallery_comments = function(args, args_not_cached, usage) {
		return imgur('/gallery/' + _.result(args, 'id') + '/comments', usage, true);
	};

	model.image = function(args, args_not_cached, usage) {
		return model.gallery(args, args_not_cached, usage)
			.catch(function(err) {
				if (err.code !== 404) {
					throw err;
				}
				return imgur('/image/' + _.result(args, 'id'), usage, true)
					.catch(function(err) {
						if (_.result(args_not_cached, 'keep_suffix') || !(_.result(args, 'id') || '').match(/.*[sbtmlh]$/) || err.code !== 404) {
							throw err;
						}
						return model.image(
							Object.assign({}, args, { id: _.result(args, 'id').slice(0, -1) }),
							Object.assign({}, args_not_cached, { keep_suffix: true }),
							usage
						);
					});
			});
	};

	return api;

	function imgur(endpoint, usage, use_mashape) {
		use_mashape = use_mashape && (params.mashape_key || process.env.MASHAPE_KEY);

		usage[use_mashape ? 'mashape-requests' : 'imgur-requests']++;

		return promisify(request)({
			url:     (use_mashape ? 'https://imgur-apiv3.p.mashape.com' : 'https://api.imgur.com') + '/3' + endpoint + '.json',
			headers: Object.assign(
				{ authorization: 'Client-ID ' + (params.key || process.env.IMGUR_CLIENT_ID) },
				use_mashape && { 'x-mashape-key': params.mashape_key || process.env.MASHAPE_KEY }
			),
			json: true
		})
			.then(function(response) {
				if (_.result(response, 'statusCode') < 400) {
					return _.chain(response)
						.result('body')
						.result('data')
						.value();
				}
				var message = (
					_.chain(response)
						.result('body')
						.result('data')
						.result('error')
						.value() ||
					_.chain(response)
						.result('data')
						.result('error')
						.value() ||
					_.result(response, 'error')
				);
				switch (response.statusCode) {
					case 400:
					case 404:
						throw new errors.NotFound(message);
					case 429:
						throw new errors.FeathersError(message, 'TooManyRequests', 429, 'too-many-requests');
					case 503:
						if (use_mashape) {
							return imgur(endpoint, usage, false);
						}
						/* falls through */
					default:
						var err = response.statusCode > 500 ?
							new errors.FeathersError(message, 'BadGateway', 502, 'bad-gateway') :
							new errors.GeneralError(message);
						err.original_code = response.statusCode;
						throw err;
				}
			});
	}
};

function image_or_album_to_content(image_or_album, as) {
	var is_album = _.result(image_or_album, 'is_album', as === 'album');
	var score    = _.result(image_or_album, 'score');
	return !_.isEmpty(image_or_album) && _.pick(
		{
			api:   'imgur',
			type:  'content',
			id:    _.result(image_or_album, 'id'),
			as:    is_album ? 'album' : 'image',
			name:  _.result(image_or_album, 'title'),
			text:  autolinker.link((_.result(image_or_album, 'description') || '').replace(/\n+$/, '').replace(/\n/g, '<br>')),
			date:  _.result(image_or_album, 'datetime') * 1000,
			image: {
				small:  'http://i.imgur.com/' + _.result(image_or_album, is_album ? 'cover' : 'id') + 's.jpg',
				medium: 'http://i.imgur.com/' + _.result(image_or_album, is_album ? 'cover' : 'id') + 'm.jpg',
				large:  'http://i.imgur.com/' + _.result(image_or_album, is_album ? 'cover' : 'id') + 'l.jpg'
			},
			gif:   _.result(image_or_album, 'animated') && (_.result(image_or_album, 'type') === 'image/gif') && _.result(image_or_album, 'mp4'),
			stats: _.pick(
				{
					views: Number(_.result(image_or_album, 'views')),
					score: _.isNumber(score) && Number(score)
				},
			_.isNumber)
		},
		_.somePredicate(_.isNumber, _.negate(_.isEmpty))
	);
}
