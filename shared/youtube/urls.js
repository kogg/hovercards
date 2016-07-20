var _   = require('underscore');
var url = require('url');

var urls = {};

urls.hostnames_parsed = ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be'];

urls.parse = function(url_obj) {
	var path_parts = url_obj.pathname.replace(/^\//, '').replace(/\/$/, '').split('/') || [];
	switch (url_obj.hostname) {
		case 'youtube.com':
		case 'www.youtube.com':
		case 'm.youtube.com':
			switch (path_parts[0]) {
				case 'watch':
					return !_.isEmpty(url_obj.query.v) && _.extend({ api: 'youtube', type: 'content', id: url_obj.query.v.replace(/[?&].*/, '') }, url_obj.query.t && { time_offset: url_obj.query.t });
				case 'embed':
				case 'v':
					return !_.isEmpty(path_parts[1]) && _.extend({ api: 'youtube', type: 'content', id: path_parts[1].replace(/[?&].*/, '') }, url_obj.query.start && { time_offset: url_obj.query.start });
				case 'attribution_link':
					return !_.isEmpty(url_obj.query.u) && urls.parse(url.parse('https://youtube.com' + url_obj.query.u, true, true));
				case 'channel':
					return !_.isEmpty(path_parts[1]) && { api: 'youtube', type: 'account', id: path_parts[1].replace(/[?&].*/, '') };
				case 'user':
					return !_.isEmpty(path_parts[1]) && { api: 'youtube', type: 'account', id: path_parts[1].replace(/[?&].*/, ''), as: 'legacy_username' };
				case 'c':
					return !_.isEmpty(path_parts[1]) && { api: 'youtube', type: 'account', id: 'c/' + path_parts[1].replace(/[?&].*/, ''), as: 'custom_url' };
				default:
					return !_.isEmpty(path_parts[0]) && !path_parts[0].match(/^(?:account|channels|dashboard|feed|logout|playlist|signin|subscription_(?:center|manager)|t|testtube|upload|yt)$/) && { api: 'youtube', type: 'account', id: path_parts[0].replace(/[?&].*/, ''), as: 'custom_url' };
			}
			break;
		case 'youtu.be':
			return !_.isEmpty(path_parts[0]) && _.extend({ api: 'youtube', type: 'content', id: path_parts[0].replace(/[?&].*/, '') }, url_obj.query.t && { time_offset: url_obj.query.t });
	}
};

urls.represent = function(identity, comment) {
	switch (identity.type) {
		case 'content':
			return [
				'https://www.youtube.com/watch?v=' + identity.id + (_.result(comment, 'id') ? '&lc=' + comment.id : ''),
				'https://youtu.be/' + identity.id + (_.result(comment, 'id') ? '?lc=' + comment.id : ''),
				'https://m.youtube.com/watch?v=' + identity.id + (_.result(comment, 'id') ? '&lc=' + comment.id : '')
			];
		case 'account':
			switch (identity.as) {
				case 'custom_url':
					return ['https://www.youtube.com/' + identity.id];
				case 'legacy_username':
					return ['https://www.youtube.com/user/' + identity.id];
				default:
					return ['https://www.youtube.com/channel/' + identity.id];
			}
	}
};

module.exports = urls;
