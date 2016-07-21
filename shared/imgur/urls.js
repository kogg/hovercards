var _ = require('underscore');

var urls = {};

urls.hostnames_parsed = ['imgur.com', 'www.imgur.com', 'i.imgur.com', 'm.imgur.com'];

urls.parse = function(url_obj) {
	var path_parts = url_obj.pathname.replace(/^\//, '').replace(/\/$/, '').split('/') || [];
	switch (path_parts[0]) {
		case 'a':
			return !_.isEmpty(path_parts[1]) && { api: 'imgur', type: 'content', id: path_parts[1], as: 'album' };
		case 'gallery':
			return !_.isEmpty(path_parts[1]) && { api: 'imgur', type: 'content', id: path_parts[1], as: 'gallery' };
		case 'user':
			return !_.isEmpty(path_parts[1]) && { api: 'imgur', type: 'account', id: path_parts[1] };
		default:
			return !_.isEmpty(path_parts[0]) && { api: 'imgur', type: 'content', id: path_parts[0].replace(/\..+?$/, ''), as: 'image' };
	}
};

urls.represent = function(identity, comment) {
	switch (identity.type) {
		case 'content':
			return _.compact([
				_.result(comment, 'id') && ('https://imgur.com/gallery/' + _.result(identity, 'id') + '/comment/' + comment.id),
				(identity.as === 'image') && ('https://imgur.com/' + identity.id),
				(identity.as === 'image') && ('https://i.imgur.com/' + identity.id),
				(identity.as === 'album') && ('https://imgur.com/a/' + identity.id),
				'https://imgur.com/gallery/' + identity.id
			]);
		case 'account':
			return ['https://imgur.com/user/' + identity.id];
	}
};

module.exports = urls;
