var _ = require('underscore');

var config = {
	endpoint: process.env.NODE_ENV === 'production' ? 'http://hover.cards/v2' : 'http://localhost:5000/v2',
	analytics_id: 'UA-64246820-3',
	apis: {
		/*
		instagram: {
			caller: require('hovercardsshared/instagram'),
			client_on_auth: true,
			client_auth_url: 'https://instagram.com/oauth/authorize/?client_id=41e56061c1e34fbbb16ab1d095dad78b&redirect_uri=https://EXTENSION_ID.chromiumapp.org/callback&response_type=token'
		},
		reddit: {
			caller: require('hovercardsshared/reddit'),
			key: '0jXqEudQPqSL6w'
		},
		soundcloud: {
			caller: require('hovercardsshared/soundcloud'),
			key: '78a827254bd7a5e3bba61aa18922bf2e'
		}
		*/
		youtube: {}
	}
};

_.each(require('hovercardsshared/config').apis, function(value, api) {
	if (!config.apis[api]) {
		return;
	}
	config.apis[api] = _.defaults(config.apis[api], value);
});

module.exports = config;
