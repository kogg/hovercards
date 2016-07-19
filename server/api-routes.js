var _          = require('underscore');
var async      = require('async');
var express    = require('express');
var passport   = require('passport');
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

function respond_to_caller(req, res, callback, err, result, usage) {
	_.each(usage, function(value, header) {
		res.append('usage-' + header, value);
	});
	if (err) {
		return callback(err);
	}
	res.json(result);
}

var callers = _.mapObject(config.apis, function(api_config) {
	return api_config.caller ? api_config.caller(api_config) : {};
});

_.each(config.apis, function(api_config, api) {
	if (api_config.authenticate) {
		api_config.authenticate(routes);
	}
	if (callers[api].content) {
		routes.get('/' + api + '/content/:id', function(req, res, callback) {
			callers[api].content(_.defaults({}, req.params, req.query, req.headers), _.partial(respond_to_caller, req, res, callback));
		});
	}

	if (callers[api].discussion) {
		routes.get('/' + api + '/content/:id/discussion', function(req, res, callback) {
			callers[api].discussion(_.defaults({}, req.params, req.query, req.headers), _.partial(respond_to_caller, req, res, callback));
		});
	}

	_.chain(api_config.discussion_apis)
	 .without(api)
	 .each(function(discussion_api) {
		if (callers[discussion_api].discussion) {
			routes.get('/' + api + '/content/:id/discussion/' + discussion_api, function(req, res, callback) {
				callers[discussion_api].discussion(
					_.defaults({ for: _.defaults({ api: api, type: 'content', id: req.params.id }, req.query.for, req.header.for) }, req.query, req.headers),
					_.partial(respond_to_caller, req, res, callback)
				);
			});
		}
	})
	 .value();

	if (callers[api].account) {
		routes.get('/' + api + '/account/:id', function(req, res, callback) {
			callers[api].account(_.defaults({}, req.params, req.query, req.headers), _.partial(respond_to_caller, req, res, callback));
		});
	}

	if (callers[api].account_content) {
		routes.get('/' + api + '/account/:id/content', function(req, res, callback) {
			callers[api].account_content(_.defaults({}, req.params, req.query, req.headers), _.partial(respond_to_caller, req, res, callback));
		});
	}

	if (process.env.NODE_ENV === 'production') {
		_.extend(callers[api].model, _.mapObject(callers[api].model, function(func, name) {
			var promises = {};

			return function(args, args_not_cached, usage, callback) {
				if (_.result(args_not_cached, 'user')) {
					// The server-side cache (ie redis) helps us use the same work we've done
					// for other users who want the same thing. An authenticated request needs
					// work that is specific to that user's view, so this doesn't apply there.
					// The user will have the request cached on the client-side, in those cases.
					return func(args, args_not_cached, usage, callback);
				}
				var key = _.chain(['cache', api, name])
					.union(_.map(args, function(val, key) {
						return key + ':' + JSON.stringify(val);
					}))
					.join('::')
					.value();

				promises[key] = promises[key] || new Promise(function(resolve, reject) {
					redis_client.get(key, function(err, result) {
						if (!err && result) {
							return async.setImmediate(function() {
								resolve(deserialize(result));
							});
						}
						func(args, args_not_cached, usage, function(err, result) {
							if (err) {
								return reject(err);
							}
							redis_client.setex(key, (api_config['cache_' + name] || api_config.cache_default || 5 * 60 * 1000) / 1000, serialize(result));
							resolve(result);
						});
					});
				});

				promises[key]
					.then(function(result) {
						delete promises[key];
						callback(null, result);
					})
					.catch(function(err) {
						delete promises[key];
						callback(err);
					});
			};
		}));
	}
});

routes.get('/in-app-messaging', function(req, res, callback) {
	async.waterfall([
		function(callback) {
			redis_client.get('active-message', function(err, activeMessage) {
				if (err) {
					return callback(err);
				}
				if (!activeMessage) {
					return callback({ message: 'No active message', status: 404 });
				}
				callback(null, activeMessage);
			});
		},
		function(activeMessage, callback) {
			redis_client.hgetall(activeMessage, function(err, message) {
				if (err) {
					return callback(err);
				}
				if (!message) {
					return callback({ message: 'No active message', status: 404 });
				}
				callback(null, [_.defaults(message, { id: activeMessage })]);
			});
		}
	], function(err, messaging) {
		if (err) {
			return callback(err);
		}
		res.json(messaging);
	});
});

/* eslint-disable no-unused-vars */
routes.use(function(err, req, res, callback) {
	/* eslint-enable no-unused-vars */
	err = _.defaults(err, { message: 'Do not recognize url ' + req.path, status: 404 });
	res.status(err.status).json(err);
});

module.exports = routes;
