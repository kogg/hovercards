var _          = require('underscore');
var errors     = require('feathers-errors');
var express    = require('express');
var passport   = require('passport');
var promisify  = require('es6-promisify');
var session    = require('express-session');
var RedisStore = require('connect-redis')(session);

var config = require('../integrations/config.js');
var redis  = require('./redis');
var report = require('../report');

var CHROMIUM_IDS = process.env.CHROMIUM_IDS.split(';');

var promises = {};

var integrations = _.chain(config.integrations)
	.pick(function(integrationConfig) {
		return (integrationConfig.environment || 'server') === 'server' || integrationConfig.authenticated_environment === 'server';
	})
	.mapObject(function(integrationConfig, integration) {
		return require('../integrations/' + integration)({
			secret_storage: {
				del: function(token) {
					// FIXME Hardcoded is bad
					return promisify(redis.del.bind(redis))('auth:twitter:' + token);
				},
				get: function(token) {
					// FIXME Hardcoded is bad
					return promisify(redis.get.bind(redis))('auth:twitter:' + token);
				}
			}
		});
	})
	.mapObject(process.env.NODE_ENV === 'production' ?
		function(api, integration) { // This is the ONLY proper use of the word "api" so far
			return Object.assign({}, api, { model: _.mapObject(api.model, function(func, name) {
				return function(args, args_not_cached, usage) {
					if (_.result(args_not_cached, 'user')) {
						// The server-side cache (ie redis) helps us use the same work we've done
						// for other users who want the same thing. An authenticated request needs
						// work that is specific to that user's view, so this doesn't apply there.
						// The user will have the request cached on the client-side, in those cases.
						return func(args, args_not_cached, usage);
					}
					var key = _.chain(['cache', integration, name])
						.union(_.map(args, function(val, key) {
							return key + ':' + JSON.stringify(val);
						}))
						.join('::')
						.value();

					promises[key] = promises[key] || promisify(redis.get.bind(redis))(key)
						.then(function(result) {
							delete promises[key];
							return result ? JSON.parse(result) : Promise.reject();
						})
						.catch(function() {
							delete promises[key];
							return func(args, args_not_cached, usage);
						});

					// Whether the promise was set before or not, reset the expiration date
					promises[key]
						.then(function(result) {
							return promisify(redis.setex.bind(redis))(key, (config.integrations[integration].cache_length || 5 * 60 * 1000) / 1000, JSON.stringify(result));
						});

					return promises[key];
				};
			}) });
		} :
		_.identity
	)
	.value();

module.exports = express.Router()
	.use(session({
		store:             new RedisStore({ client: redis }),
		secret:            (process.env.SECURE_KEY || '').split(','),
		saveUninitialized: false,
		resave:            false
	}))
	.use(passport.initialize())
	.use(passport.session())

	.param('integration', function(req, res, next, integration) {
		if (!integrations[integration]) {
			return next(new errors.NotFound());
		}
		next();
	})

	.get('/:integration/content/:id', function(req, res, next) {
		if (!integrations[req.params.integration].content) {
			return next(new errors.NotFound());
		}
		integrations[req.params.integration].content(Object.assign({}, req.headers, req.query, { id: req.params.id }))
			.then(function(result) {
				res.json(result);
			})
			.catch(next);
	})
	.get('/:integration/content/:id/discussion', function(req, res, next) {
		if (!integrations[req.params.integration].discussion) {
			return next(new errors.NotFound());
		}
		integrations[req.params.integration].discussion(Object.assign({}, req.headers, req.query, { id: req.params.id }))
			.then(function(result) {
				res.json(result);
			})
			.catch(next);
	})
	.get('/:for_integration/content/:for_id/discussion/:integration', function(req, res, next) {
		if (!integrations[req.params.integration].discussion) {
			return next(new errors.NotFound());
		}
		integrations[req.params.integration].discussion(Object.assign({}, req.headers, req.query, { for: { integration: req.params.for_integration, type: 'content', id: req.params.for_id } }))
			.then(function(result) {
				res.json(result);
			})
			.catch(next);
	})
	.get('/:integration/account/:id', function(req, res, next) {
		if (!integrations[req.params.integration].account) {
			return next(new errors.NotFound());
		}
		integrations[req.params.integration].account(Object.assign({}, req.headers, req.query, { id: req.params.id }))
			.then(function(result) {
				res.json(result);
			})
			.catch(next);
	})

	.get('/:integration/authenticate', function(req, res, next) {
		if (!config.integrations[req.params.integration].authenticatable || config.integrations[req.params.integration].authentication_url || !_.contains(CHROMIUM_IDS, req.query.chromium_id)) {
			return next(new errors.BadRequest());
		}
		passport.authenticate(req.params.integration, { session: false, callbackURL: '/v2/' + req.params.integration + '/callback?chromium_id=' + req.query.chromium_id })(req, res, next);
	})
	.get(
		'/:integration/callback',
		function(req, res, next) {
			if (!config.integrations[req.params.integration].authenticatable || config.integrations[req.params.integration].authentication_url || !_.contains(CHROMIUM_IDS, req.query.chromium_id)) {
				return next(new errors.BadRequest());
			}
			passport.authenticate(req.params.integration, { session: false })(req, res, next);
		},
		function(req, res) {
			res.redirect('https://' + req.query.chromium_id + '.chromiumapp.org/callback#access_token=' + req.user);
		}
	)

	/*
	 * TODO #47
	.get('/in-app-messaging', function(req, res, next) {
		promisify(redis.get.bind(redis))('active-message')
			.then(function(activeMessage) {
				if (!activeMessage) {
					throw new errors.NotFound('No active message');
				}
				return promisify(redis.hgetall.bind(redis))(activeMessage)
					.then(function(message) {
						if (!message) {
							throw new errors.NotFound('No active message');
						}
						return [_.defaults(message, { id: activeMessage })];
					});
			})
			.then(function(result) {
				res.json(result);
			})
			.catch(next);
	})
	*/

	.use(report.errorHandler())
	.use(function(err, req, res, next) { // eslint-disable-line no-unused-vars
		err.message = err.message || 'Do not recognize url ' + req.path;
		err.status = err.status || err.code || 500;
		res.status(err.status).json(err);
	});
