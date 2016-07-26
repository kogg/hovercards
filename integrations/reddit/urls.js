var _ = require('underscore');

var urls = {};

urls.hostnames_parsed = ['reddit.com', 'www.reddit.com', 'np.reddit.com', 'm.reddit.com', 'redd.it', 'redditmedia.com', 'www.redditmedia.com'];
urls.non_content_ids = /^(?:ads|advertising|blog|buttons|code|contact|controversial|domain|gilded|gold|help|jobs|login|message|new|password|prefs|rising|rules|submit|subreddits|top|wiki)$/;

urls.parse = function(url_obj) {
	var pathname = (url_obj.pathname || '').replace(/\/$/, '');
	var match;
	if ((match = pathname.match(/^\/(?:u(?:ser)?)\/([^/]+)(?:\/[^/]+)?$/)) && match[1]) {
		return { api: 'reddit', type: 'account', id: match[1] };
	}
	if ((match = pathname.match(/^(?:\/r\/([^/]+))?(?:\/comments)?\/([^/]+)(?:\/.+)?$/)) && match[2]) {
		if (match[1]) {
			return { api: 'reddit', type: 'content', id: match[2], subreddit: match[1] };
		}
		if (match[2] === 'r') {
			return;
		}
		if (match[2].match(urls.non_content_ids)) {
			return;
		}
		return { api: 'reddit', type: 'content', id: match[2] };
	}
};

urls.represent = function(identity, comment) {
	switch (identity.type) {
		case 'content':
			return ['https://www.reddit.com' + (identity.subreddit ? '/r/' + identity.subreddit : '') + '/comments/' + identity.id + (_.result(comment, 'id') ? '/comment/' + comment.id : ''), 'https://redd.it/' + identity.id];
		case 'account':
			return ['https://www.reddit.com/user/' + identity.id];
	}
};

module.exports = urls;
