/* eslint-disable */
var _          = require('underscore');
var express    = require('express');
var passport   = require('passport');
var session    = require('express-session');
var RedisStore = require('connect-redis')(session);

var redis_client = require('../redis-client');

var routes = express.Router();

routes.use(session({
	store:             new RedisStore({ client: redis_client }),
	secret:            (process.env.SECURE_KEY || '').split(','),
	saveUninitialized: false,
	resave:            false
}));
routes.use(passport.initialize());
routes.use(passport.session());

routes.get('/feedback_url', function(req, res) {
    redis_client.get('feedback_url', function(err, result) {
        if (err) {
            return res.json({ feedback_url: null });
        }
        res.json({ feedback_url: result });
    });
});

_.invoke(require('./apis'), 'authentication', routes);

var cache_version = 1;
_.each(require('./apis'), function(api, api_name) {
    _.chain(api)
     .result('methods')
     .functions()
     .filter(function(method) {
         return method.indexOf('__') === 0;
     })
     .each(function(method) {
         var cache_options = api.methods[method].cache_options || {};
         api.methods[method] = _.wrap(api.methods[method], function(func, args_to_cache, args_not_to_cache, callback) {
             var key_prefix = api_name + ':' + method.replace(/^__/, '') + ':' + (cache_options.version || 0);
             var cache_key = key_prefix + ':' + cache_version + ':' + JSON.stringify(args_to_cache);

            redis_client.get(cache_key, function(err, result) {
                if (!err && result) {
                    result = JSON.parse(result);
                    return callback(null, result);
                }
                func(args_to_cache, args_not_to_cache, function(err, result) {
                    if (!err && !result.dont_cache) {
                        redis_client.set(cache_key, JSON.stringify(result), function() {
                            redis_client.expire(cache_key, cache_options.ttl || 5 * 60);
                        });
                    }
                    callback(err, result);
                });
            });
         });
     });
});

_.each(require('./apis'), function(api, api_name) {
    _.chain(api)
     .result('methods')
     .functions()
     .intersection(['content', 'discussion', 'account', 'more_content', 'url'])
     .each(function(method) {
        routes.get('/' + api_name + '/' + method, function(req, res, callback) {
            api.methods[method](_.extend({ user: req.headers.user }, req.query), function(err, content) {
                if (err) {
                    return callback(err);
                }
                res.json(content);
                callback();
            });
        });
    });
});

// Error Handler
routes.use(function(err, req, res, callback) {
    res.status(err.status || err.code || 500).json(err);
    callback();
});

module.exports = routes;
