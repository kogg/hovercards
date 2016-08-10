module.exports = {
	authenticatable:         true,
	authentication_url:      'https://instagram.com/oauth/authorize/?scope=basic+public_content&client_id=' + process.env.INSTAGRAM_CLIENT_ID + '&redirect_uri=https://EXTENSION_ID.chromiumapp.org/callback&response_type=token',
	environment:             'client',
	content_security_policy: {
		'img-src':   ['scontent.cdninstagram.com'],
		'media-src': ['scontent.cdninstagram.com']
	},
	account: {
		stats: ['content', 'followers', 'following']
	},
	content: {
		stats: ['likes', 'comments']
	},
	discussion: {
		integrations: ['instagram', 'reddit']
	}
};
