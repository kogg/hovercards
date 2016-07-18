/* eslint-disable */
var _               = require('underscore');
var TwitterStrategy = require('passport-twitter').Strategy;
var passport        = require('passport');

var redis_client = require('../../redis-client');

var CHROMIUM_IDS = process.env.CHROMIUM_IDS.split(';');

module.exports = {
    imgur: {
        methods: require('./imgur')(process.env.MASHAPE_KEY ? { key: process.env.IMGUR_CLIENT_ID, mashape_key: process.env.MASHAPE_KEY } :
                                                              { key: process.env.IMGUR_CLIENT_ID })
    },
    instagram: {
        methods: require('./instagram')({ key: process.env.INSTAGRAM_CLIENT_ID, secret: process.env.INSTAGRAM_CLIENT_SECRET })
    },
    twitter: {
        methods: require('./twitter')({
            key:              process.env.TWITTER_CONSUMER_KEY,
            secret:           process.env.TWITTER_CONSUMER_SECRET,
            app_token:        process.env.TWITTER_APP_ACCESS_TOKEN,
            app_token_secret: process.env.TWITTER_APP_ACCESS_TOKEN_SECRET,
            get_token_secret: function(token, callback) {
                redis_client.get('twitter:secret:' + token, callback);
            },
            del_token_secret: function(token, callback) {
                redis_client.del('twitter:secret:' + token, callback);
            }
        }),
        authentication: function(routes) {
            passport.use('twitter-old', new TwitterStrategy({
                consumerKey:    process.env.TWITTER_CONSUMER_KEY,
                consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
                callbackURL:    '/v1/twitter/callback'
            }, function(token, tokenSecret, profile, callback) {
                redis_client.set('twitter:secret:' + token, tokenSecret, _.partial(callback, _, token));
            }));

            routes.get('/twitter/authenticate', function(req, res, callback) {
                if (!_.contains(CHROMIUM_IDS, req.query.chromium_id)) {
                    return callback({ status: 400 });
                }
                passport.authenticate('twitter-old', { session: false, callbackURL: '/v1/twitter/callback?chromium_id=' + req.query.chromium_id })(req, res, callback);
            });
            routes.get('/twitter/callback', passport.authenticate('twitter-old', { session: false }), function(req, res, callback) {
                if (!_.contains(CHROMIUM_IDS, req.query.chromium_id)) {
                    return callback({ status: 400 });
                }
                res.redirect('https://' + req.query.chromium_id + '.chromiumapp.org/callback#access_token=' + req.user);
            });
        }
    },
    youtube: {
        methods: require('./youtube')({ key: process.env.GOOGLE_SERVER_KEY })
    }
};
