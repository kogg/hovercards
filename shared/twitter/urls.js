var _ = require('underscore');

var urls = {};

urls.hostnames_parsed = ['twitter.com', 'www.twitter.com', 'm.twitter.com', 'mobile.twitter.com'];

// FROM: https://dev.twitter.com/rest/reference/get/help/configuration
urls.non_username_regex = /^(?:about|accounts?|activity|all|announcements|anywhere|api(?:_?rules|_terms)|apps|auth|badges|blog|business|buttons|contacts|devices|direct_messages|downloads?|edit_announcements|faq|favorites|find_(?:sources|users)|follow(?:ers|ing)|friend(?:s|_?request)|goodies|hashtag|help|home|i|im_account|inbox|invitations|invite|jobs|list|log(?:in|o|out)|me|media_signup|mentions|messages|mockview|newtwitter|notifications|nudge|oauth|phoenix_search|positions|privacy|public_timeline|related_tweets|replies|retweet(?:ed_of_mine|s|s_by_others)|rules|saved_searches|search|sent|sessions|settings|share|sign(?:in|up)|similar_to|statistics|terms|tos|translate|trends|tweetbutton|twttr|update_discoverability|users|welcome|who_to_follow|widgets|zendesk_auth)$/;

urls.parse = function(url_obj) {
	var path_parts = url_obj.pathname.replace(/^\//, '').replace(/\/$/, '').split('/') || [];
	if (path_parts[0] === 'intent') {
		switch (path_parts[1]) {
			case 'tweet':
				return !_.isEmpty(url_obj.query.in_reply_to) && { api: 'twitter', type: 'content', id: url_obj.query.in_reply_to };
			case 'favorite':
			case 'retweet':
				return !_.isEmpty(url_obj.query.tweet_id) && { api: 'twitter', type: 'content', id: url_obj.query.tweet_id };
			case 'follow':
			case 'user':
				return !_.isEmpty(url_obj.query.screen_name) && { api: 'twitter', type: 'account', id: url_obj.query.screen_name };
			default:
				return;
		}
	}
	if (path_parts.length === 1 && _.isEmpty(path_parts[0]) && (url_obj.hash || '').indexOf('#!') === 0) {
		path_parts = url_obj.hash.replace(/^#!\//, '').replace(/\/$/, '').split('/') || [];
	}
	if (_.isEmpty(path_parts[0]) || path_parts[0].match(urls.non_username_regex)) {
		return;
	}
	var account = { api: 'twitter', type: 'account', id: path_parts[0] };
	if (_.isEmpty(path_parts[1]) || !path_parts[1].match(/^status(?:es)?$/)) {
		return account;
	}
	return !_.isEmpty(path_parts[2]) && { api: 'twitter', type: 'content', id: path_parts[2], account: account };
};

urls.represent = function(identity) {
	switch (identity.type) {
		case 'content':
			return ['https://twitter.com/' + (_.result(identity.account, 'id') || 'screen_name') + '/status/' + identity.id];
		case 'account':
			return ['https://twitter.com/' + identity.id];
	}
};

module.exports = urls;
