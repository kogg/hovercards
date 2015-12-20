var _             = require('underscore');
var shared_config = require('hovercardsshared/config');

var config = {
	endpoint: process.env.NODE_ENV === 'production' ? 'http://hover.cards/v2' : 'http://localhost:5000/v2',
	analytics_id: 'UA-64246820-3',
	apis: {
		imgur: {},
		instagram: {
			client_on_auth: true,
			client_auth_url: 'https://instagram.com/oauth/authorize/?client_id=41e56061c1e34fbbb16ab1d095dad78b&redirect_uri=https://EXTENSION_ID.chromiumapp.org/callback&response_type=token'
		},
		reddit: {
			key: '0jXqEudQPqSL6w'
		},
		soundcloud: {
			key: '78a827254bd7a5e3bba61aa18922bf2e'
		},
		twitter: {},
		youtube: {}
	}
};

var apis = _.intersection(_.keys(config.apis), _.keys(shared_config.apis));

config.apis = _.chain(config.apis)
               .pick(apis)
               .each(function(api_config, api) { _.defaults(api_config, shared_config.apis[api]); })
               .value();

module.exports = config;
