var _ = require('underscore');

var urls = {};

urls.hostnames_parsed = ['soundcloud.com', 'www.soundcloud.com', 'm.soundcloud.com'];

urls.non_username_regex = /^(?:explore|groups|jobs|messages|mobile|notifications|pages|people|pro|settings|stream|tags|terms-of-use|upload(?:-classic)?|you)$/;
urls.non_trackname_regex = /^(?:comments|groups|follow(?:ers|ing)|likes|tracks)$/;

urls.parse = function(url_obj) {
	var path_parts = url_obj.pathname.replace(/^\//, '').replace(/\/$/, '').split('/') || [];
	if (_.isEmpty(path_parts[0]) || path_parts[0].match(urls.non_username_regex)) {
		return;
	}
	var account = { api: 'soundcloud', type: 'account', id: path_parts[0] };
	if (_.isEmpty(path_parts[1]) || path_parts[1].match(urls.non_trackname_regex)) {
		return account;
	}
	var content = { api: 'soundcloud', type: 'content', id: path_parts[1], account: account };
	if (path_parts[1] === 'sets') {
		if (_.isEmpty(path_parts[2])) {
			return account;
		}
		_.extend(content, { id: path_parts[2], as: 'playlist' });
	}
	if (url_obj.hash) {
		var hash_parts = url_obj.hash.match(/t=(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?/);
		if (hash_parts) {
			content.meta = { time_offset: (Number(hash_parts[1] || 0) * 3600) + (Number(hash_parts[2] || 0) * 60) + Number(hash_parts[3] || 0) };
		}
	}
	return content;
};

urls.represent = function(identity, comment) {
	switch (identity.type) {
		case 'content':
			return ['https://soundcloud.com/' + (_.result(identity.account, 'id') || 'screen_name') + (identity.as === 'playlist' ? '/sets' : '') + '/' + identity.id + (_.result(comment, 'id') ? '/comments/' + comment.id : '')];
		case 'account':
			return ['https://soundcloud.com/' + identity.id];
		default:
			return null;
	}
};

module.exports = urls;
