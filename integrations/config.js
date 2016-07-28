module.exports = {
	counts: {
		grid:   21,
		listed: 30
	},
	integrations: {
		imgur:      require('./imgur/config'),
		instagram:  require('./instagram/config'),
		reddit:     require('./reddit/config'),
		soundcloud: require('./soundcloud/config'),
		twitter:    require('./twitter/config'),
		youtube:    require('./youtube/config')
	}
};
