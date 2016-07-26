var _               = require('underscore');
var TwitterStrategy = require('passport-twitter').Strategy;
var passport        = require('passport');
var redis_client    = require('./redis-client');
var shared_config   = require('../integrations/config');

var CHROMIUM_IDS = process.env.CHROMIUM_IDS.split(';');

var youtube_keys = [process.env.GOOGLE_SERVER_KEY];
for (var i = 2; process.env['GOOGLE_SERVER_KEY_' + i]; i++) {
	youtube_keys.push(process.env['GOOGLE_SERVER_KEY_' + i]);
}

var config = {
	integrations: {
		imgur: {
			caller:      require('../integrations/imgur'),
			key:         process.env.IMGUR_CLIENT_ID,
			mashape_key: process.env.MASHAPE_KEY
		},
		instagram: {
			caller: require('../integrations/instagram'),
			key:    process.env.INSTAGRAM_CLIENT_ID,
			secret: process.env.INSTAGRAM_CLIENT_SECRET
		},
		reddit:     {},
		soundcloud: {},
		twitter:    {
			caller:          require('../integrations/twitter'),
			key:             process.env.TWITTER_CONSUMER_KEY,
			secret:          process.env.TWITTER_CONSUMER_SECRET,
			app_user:        process.env.TWITTER_APP_ACCESS_TOKEN,
			app_user_secret: process.env.TWITTER_APP_ACCESS_TOKEN_SECRET
		},
		youtube: (youtube_keys.length === 1) ? {
			caller: require('../integrations/youtube'),
			key:    _.first(youtube_keys)
		} : {
			caller: require('../integrations/youtube'),
			keys:   youtube_keys
		}
	}
};

config.integrations.twitter.secret_storage = {
	del: function(token, callback) {
		redis_client.del('auth:twitter:' + token, callback);
	},
	get: function(token, callback) {
		redis_client.get('auth:twitter:' + token, callback);
	}
};

config.integrations.twitter.authenticate = function(routes) {
	passport.use(new TwitterStrategy({
		consumerKey:    process.env.TWITTER_CONSUMER_KEY,
		consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
		callbackURL:    '/v2/twitter/callback'
	}, function(token, tokenSecret, profile, callback) {
		redis_client.set('auth:twitter:' + token, tokenSecret, _.partial(callback, _, token));
	}));

	routes.get('/twitter/authenticate', function(req, res, callback) {
		if (!_.contains(CHROMIUM_IDS, req.query.chromium_id)) {
			return callback({ status: 400 });
		}
		passport.authenticate('twitter', { session: false, callbackURL: '/v2/twitter/callback?chromium_id=' + req.query.chromium_id })(req, res, callback);
	});
	routes.get('/twitter/callback', passport.authenticate('twitter', { session: false }), function(req, res, callback) {
		if (!_.contains(CHROMIUM_IDS, req.query.chromium_id)) {
			return callback({ status: 400 });
		}
		res.redirect('https://' + req.query.chromium_id + '.chromiumapp.org/callback#access_token=' + req.user);
	});
};

var integrations = _.intersection(_.keys(config.integrations), _.keys(shared_config.integrations));

config.integrations = _.chain(config.integrations)
	.pick(integrations)
	.each(function(api_config, api) {
		_.defaults(api_config, shared_config.integrations[api]);
	})
	.value();

module.exports = config;
