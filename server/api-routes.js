var _          = require('underscore');
var express    = require('express');
var passport   = require('passport');
var promisify  = require('es6-promisify');
var session    = require('express-session');
var RedisStore = require('connect-redis')(session);

var config       = require('./config');
var redis_client = require('./redis-client');

var routes = express.Router();

routes.use(session({
	store:             new RedisStore({ client: redis_client }),
	secret:            (process.env.SECURE_KEY || '').split(','),
	saveUninitialized: false,
	resave:            false
}));
routes.use(passport.initialize());
routes.use(passport.session());

var serialize   = JSON.stringify;
var deserialize = JSON.parse;

var callers = _.mapObject(config.integrations, function(api_config) {
	return api_config.caller ? api_config.caller(api_config) : {};
});

_.each(config.integrations, function(api_config, api) {
	if (api_config.authenticate) {
		api_config.authenticate(routes);
	}
	if (callers[api].content) {
		routes.get('/' + api + '/content/:id', function(req, res, callback) {
			callers[api].content(_.defaults({}, req.params, req.query, req.headers))
				.then(function(result) {
					res.json(result);
				})
				.catch(callback);
		});
	}

	if (callers[api].discussion) {
		routes.get('/' + api + '/content/:id/discussion', function(req, res, callback) {
			callers[api].discussion(_.defaults({}, req.params, req.query, req.headers))
				.then(function(result) {
					res.json(result);
				})
				.catch(callback);
		});
	}

	_.chain(api_config.discussion_integrations)
	 .without(api)
	 .each(function(discussion_api) {
		if (callers[discussion_api].discussion) {
			routes.get('/' + api + '/content/:id/discussion/' + discussion_api, function(req, res, callback) {
				callers[discussion_api].discussion(_.defaults({ for: _.defaults({ api: api, type: 'content', id: req.params.id }, req.query.for, req.header.for) }, req.query, req.headers))
					.then(function(result) {
						res.json(result);
					})
					.catch(callback);
			});
		}
	})
	 .value();

	if (callers[api].account) {
		routes.get('/' + api + '/account/:id', function(req, res, callback) {
			callers[api].account(_.defaults({}, req.params, req.query, req.headers))
				.then(function(result) {
					res.json(result);
				})
				.catch(callback);
		});
	}

	if (callers[api].account_content) {
		routes.get('/' + api + '/account/:id/content', function(req, res, callback) {
			callers[api].account_content(_.defaults({}, req.params, req.query, req.headers))
				.then(function(result) {
					res.json(result);
				})
				.catch(callback);
		});
	}

	if (process.env.NODE_ENV === 'production') {
		_.extend(callers[api].model, _.mapObject(callers[api].model, function(func, name) {
			var promises = {};

			return function(args, args_not_cached, usage) {
				if (_.result(args_not_cached, 'user')) {
					// The server-side cache (ie redis) helps us use the same work we've done
					// for other users who want the same thing. An authenticated request needs
					// work that is specific to that user's view, so this doesn't apply there.
					// The user will have the request cached on the client-side, in those cases.
					return func(args, args_not_cached, usage);
				}
				var key = _.chain(['cache', api, name])
					.union(_.map(args, function(val, key) {
						return key + ':' + JSON.stringify(val);
					}))
					.join('::')
					.value();

				promises[key] = promises[key] || promisify(redis_client.get.bind(redis_client))(key)
					.then(function(result) {
						if (result) {
							return deserialize(result);
						}
						return Promise.reject();
					})
					.catch(function() {
						return func(args, args_not_cached, usage);
					});

				promises[key]
					.then(function(result) {
						promisify(redis_client.setex.bind(redis_client))(key, (api_config.cache_length || 5 * 60 * 1000) / 1000, serialize(result));
					});

				promises[key]
					.then(function() {
						delete promises[key];
					})
					.catch(function() {
						delete promises[key];
					});

				return promises[key];
			};
		}));
	}
});

routes.get('/in-app-messaging', function(req, res, callback) {
	promisify(redis_client.get.bind(redis_client))('active-message')
		.then(function(activeMessage) {
			if (!activeMessage) {
				return Promise.reject({ message: 'No active message', status: 404 });
			}
			return promisify(redis_client.hgetall.bind(redis_client))(activeMessage)
				.then(function(message) {
					if (!message) {
						return Promise.reject({ message: 'No active message', status: 404 });
					}
					return [_.defaults(message, { id: activeMessage })];
				});
		})
		.then(function(result) {
			res.json(result);
		})
		.catch(callback);
});

/* eslint-disable no-unused-vars */
routes.use(function(err, req, res, callback) {
	/* eslint-enable no-unused-vars */
	err = _.defaults(err, { message: 'Do not recognize url ' + req.path, status: 404 });
	res.status(err.status).json(err);
});

module.exports = routes;
