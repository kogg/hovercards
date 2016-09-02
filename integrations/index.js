var _         = require('underscore');
var promisify = require('es6-promisify');

var config = require('./config');
var redis  = require('../server/redis');

var promises = {};

module.exports = _.chain(config.integrations)
	.pick(function(integrationConfig) {
		return (integrationConfig.environment || 'server') === 'server' || integrationConfig.authenticated_environment === 'server';
	})
	.mapObject(function(integrationConfig, integration) {
		// HACK This only applied to twitter
		return require('../integrations/' + integration)({
			secret_storage: {
				del: function(token) {
					return promisify(redis.del.bind(redis))('auth:twitter:' + token);
				},
				get: function(token) {
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

