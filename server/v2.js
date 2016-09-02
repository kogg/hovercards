var _               = require('underscore');
var TwitterStrategy = require('passport-twitter').Strategy;
var errors          = require('feathers-errors');
var feathers        = require('feathers');
var passport        = require('passport');
// var promisify       = require('es6-promisify');
var session         = require('express-session');
var RedisStore      = require('connect-redis')(session);

var config       = require('../integrations/config');
var integrations = require('../integrations');
var redis        = require('./redis');
var report       = require('../report');

var CHROMIUM_IDS = process.env.CHROMIUM_IDS.split(';');

// HACK This only applied to twitter
passport.use(new TwitterStrategy({
	consumerKey:    process.env.TWITTER_CONSUMER_KEY,
	consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
	callbackURL:    '/v2/twitter/callback'
}, function(token, tokenSecret, profile, callback) {
	redis.set('auth:twitter:' + token, tokenSecret, _.partial(callback, _, token));
}));

module.exports = feathers.Router()
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
	 * TODO https://github.com/kogg/hovercards/issues/47
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
		res.status(err.code || 500).json(err);
	});
