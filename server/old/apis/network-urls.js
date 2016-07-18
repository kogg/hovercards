/* eslint-disable */
var URI = require('urijs/src/URI');

var WHITELISTED_SUBDOMAINS = { '': true, i: true, m: true, np: true, www: true };

exports.identify = function(url) {
	url = (url || '').replace(/\/$/, '');
	var first_query_delimeter = url.match(/[?&]/);
	if (first_query_delimeter) {
		url = url.substring(0, first_query_delimeter.index) + '?' + (url.substring(first_query_delimeter.index + 1) || '').replace(/\?/, '&');
	}
	var uri = URI(url).normalize();
	if (!uri.protocol()) {
		uri = URI('http://' + url).normalize();
	}
	var account;
	var match;
	var query;

	if (!(uri.subdomain() in WHITELISTED_SUBDOMAINS)) {
		return;
	}

	switch (uri.domain()) {
		case 'facebook.com':
			if (uri.path().match(/^\/l\.php\/?$/)) {
				query = uri.search(true);
				if (!query.u) {
					break;
				}
				return exports.identify(query.u);
			}
			break;
		case 'imgur.com':
			if ((match = uri.path().match(/^\/user\/([^/]+)(?:\/(?:submitted|favorites|index)(?:\/[^/]+)?)?\/?$/)) && match[1]) {
				return { api: 'imgur', type: 'account', id: match[1] };
			}
			if ((match = uri.path().match(/^(?:\/(a|gallery))?\/([^/.]+)(?:\/[^/.]+)?(?:\.[a-z]+)?\/?$/)) && match[2]) {
				return { api: 'imgur', type: 'content', id: match[2], as: match[1] === 'a' ? 'album' : match[1] || 'image' };
			}
			break;
		case 'instagr.am':
		case 'instagram.com':
			if (!(match = uri.path().match(/^(?:(?:\/([^/]+))|(?:\/p\/([^/]+)(?:\/embed.*)?))\/?$/))) {
				return;
			}
			if (match[1]) {
				if (match[1].match(/^(?:about|developer|press)$/)) {
					return null;
				}
				return { api: 'instagram', type: 'account', id: match[1] };
			}
			if (match[2]) {
				return { api: 'instagram', type: 'content', id: (match[2] || '').substr(0, 10) };
			}
			break;
		case 'reddit.com':
		case 'redditmedia.com':
			if ((match = uri.path().match(/^\/(?:u(?:ser)?)\/([^/]+)(?:\/[^/]+)?\/?$/)) && match[1]) {
				return { api: 'reddit', type: 'account', id: match[1] };
			}
			if ((match = uri.path().match(/^(?:\/r\/([^/]+))?\/comments\/([^/]+)(?:\/[^/]+(?:\/([^/]+))?)?\/?$/)) && match[2]) {
				var reddit_content = { api: 'reddit', type: 'content', id: match[2] };
				if (match[1]) {
					reddit_content.subreddit = match[1];
				}
				var comment_id = uri.search(true).comment || match[3];
				if (comment_id) {
					reddit_content.comments_focus_id = comment_id;
				}
				return reddit_content;
			}
			break;
		case 'redd.it':
			if ((match = uri.path().match(/^\/([^/]+)$/)) && match[1]) {
				return { api: 'reddit', type: 'content', id: match[1] };
			}
			break;
		case 'soundcloud.com':
			if ((match = uri.path().match(/^\/([^/]+)(?:\/(sets))?(?:\/([^/]+))?(?:\/[^/]+)?\/?$/)) && match[1]) {
				if (match[1].match(/^(?:explore|groups|jobs|messages|mobile|notifications|pages|people|pro|settings|stream|tags|terms-of-use|upload(?:-classic)?|you)$/)) {
					return null;
				}
				account = { api: 'soundcloud', type: 'account', id: match[1] };
				if (!match[3] || match[3].match(/^(?:comments|groups|followers|following|likes|tracks)$/)) {
					return account;
				}
				return { api: 'soundcloud', type: 'content', id: match[3], as: match[2] ? 'playlist' : 'track', account: account };
			}
			break;
		case 'twitter.com':
			if (uri.path() === '/' && uri.hash().match(/^#!\//)) {
				uri.path(uri.hash().replace(/^#!/, ''));
			}
			if ((match = uri.path().match(/^\/intent\/([^/]+)\/?$/)) && match[1]) {
				query = uri.search(true);
				switch (match[1]) {
					case 'tweet':
						if (!query.in_reply_to) {
							return;
						}
						return { api: 'twitter', type: 'content', id: query.in_reply_to };
					case 'retweet':
					case 'favorite':
						if (!query.tweet_id) {
							return;
						}
						return { api: 'twitter', type: 'content', id: query.tweet_id };
					case 'user':
					case 'follow':
						if (!query.screen_name) {
							return;
						}
						return { api: 'twitter', type: 'account', id: query.screen_name };
				}
			}
			if ((match = uri.path().match(/^\/([^/]+)(?:(?:\/[^/]+)|(?:\/status(?:es)?\/([^/]+)))?\/?$/)) && match[1]) {
				if (match[1].match(/^(?:downloads?|hashtag|intent|favorites|followers|following|home|i|search|share|settings|who_to_follow)$/)) {
					return;
				}
				account = { api: 'twitter', type: 'account', id: match[1] };
				if (match[2]) {
					return { api: 'twitter', type: 'content', id: match[2], account: account };
				}
				return account;
			}
			break;
		case 'youtube.com':
			if (uri.path().match(/^\/watch\/?$/)) {
				query = uri.search(true);
				if (!query.v) {
					return;
				}
				if (query.t) {
					return { api: 'youtube', type: 'content', id: query.v, time_offset: query.t };
				}
				return { api: 'youtube', type: 'content', id: query.v };
			}
			if (uri.path().match(/^\/attribution_link\/?$/)) {
				query = uri.search(true);
				if (!query.u) {
					break;
				}
				return exports.identify('https://' + uri.domain() + query.u);
			}
			if ((match = uri.path().match(/^\/(?:embed|v)\/([^/]+)\/?$/)) && match[1]) {
				query = uri.search(true);
				if (query.start) {
					return { api: 'youtube', type: 'content', id: match[1], time_offset: query.start };
				}
				return { api: 'youtube', type: 'content', id: match[1] };
			}
			if ((match = uri.path().match(/^(?:\/(user|channel|c))?\/([^/]+)(?:\/[^/]+)?\/?$/)) && match[2]) {
				if (match[2].match(/^(?:account|channels|dashboard|feed|logout|playlist|signin|subscription_(?:center|manager)|t|testtube|upload|yt)$/)) {
					return;
				}
				var youtube_account = { api: 'youtube', type: 'account', id: match[2] };
				switch (match[1]) {
					case 'channel':
						break;
					case 'user':
						youtube_account.as = 'legacy_username';
						break;
					case 'c':
						youtube_account.id = 'c/' + youtube_account.id;
						/* falls through */
					default:
						youtube_account.as = 'custom_url';
						break;
				}
				return youtube_account;
			}
			break;
		case 'youtu.be':
			if (!uri.filename()) {
				break;
			}
			query = uri.search(true);
			if (query.t) {
				return { api: 'youtube', type: 'content', id: uri.filename(), time_offset: query.t };
			}
			return { api: 'youtube', type: 'content', id: uri.filename() };
	}
};

exports.generate = function(obj) {
	if (!obj || !obj.api || !obj.id) {
		return;
	}
	switch (obj.api) {
		case 'imgur':
			switch (obj.type) {
				case 'content':
				case 'discussion':
					switch (obj.as) {
						case 'album':
							return 'https://imgur.com/a/' + obj.id;
						case 'image':
							return 'https://imgur.com/' + obj.id;
						case 'gallery':
							/* falls through */
						default:
							return 'https://imgur.com/gallery/' + obj.id;
					}
					break;
				case 'account':
					return 'https://imgur.com/user/' + obj.id;
			}
			break;
		case 'instagram':
			switch (obj.type) {
				case 'content':
				case 'discussion':
					return 'https://instagram.com/p/' + obj.id + '/';
				case 'account':
					return 'https://instagram.com/' + obj.id;
			}
			break;
		case 'reddit':
			switch (obj.type) {
				case 'content':
				case 'discussion':
					return 'https://www.reddit.com/' + (obj.subreddit ? 'r/' + obj.subreddit + '/comments/' : '') + obj.id;
				case 'account':
					return 'https://www.reddit.com/user/' + obj.id;
			}
			break;
		case 'soundcloud':
			switch (obj.type) {
				case 'content':
				case 'discussion':
					return 'https://soundcloud.com/' + obj.account.id + '/' + (obj.as === 'playlist' ? 'sets/' : '') + obj.id;
				case 'account':
					return 'https://soundcloud.com/' + obj.id;
			}
			break;
		case 'twitter':
			switch (obj.type) {
				case 'content':
					return 'https://twitter.com/' + ((obj.account && obj.account.id) || 'screen_name') + '/status/' + obj.id;
				case 'account':
					return 'https://twitter.com/' + obj.id;
			}
			break;
		case 'youtube':
			switch (obj.type) {
				case 'content':
				case 'discussion':
					return 'https://www.youtube.com/watch?v=' + obj.id;
				case 'account':
					switch (obj.as) {
						case 'custom_url':
							return 'https://www.youtube.com/' + obj.id;
						case 'legacy_username':
							return 'https://www.youtube.com/user/' + obj.id;
						default:
							return 'https://www.youtube.com/channel/' + obj.id;
					}
			}
			break;
	}
};

exports.share = function(obj, shared_api) {
	var url = encodeURIComponent(exports.generate(obj));
	if (!url || url === 'undefined') {
		return;
	}
	var title = encodeURIComponent(obj.name || obj.description);
	if (title === 'undefined') {
		title = undefined;
	}
	switch (shared_api) {
		case 'facebook':
			return 'https://www.facebook.com/sharer/sharer.php?u=' + url;
		case 'reddit':
			return 'https://www.reddit.com/submit?url=' + url + (title ? '&title=' + title : '') + '&resubmit=true';
		case 'twitter':
			return 'https://twitter.com/intent/tweet?url=' + url + (title ? '&text=' + title : '') + '&via=hovercards&source=https://hovercards.com';
	}
};
