var _ = require('underscore');

var urls = {};

urls.hostnames_parsed = ['instagram.com', 'www.instagram.com', 'instagr.am'];

urls.parse = function(url_obj) {
	var path_parts = url_obj.pathname.replace(/^\//, '').replace(/\/$/, '').split('/') || [];
	if (path_parts[0] === 'p') {
		return !_.isEmpty(path_parts[1]) && { api: 'instagram', type: 'content', id: path_parts[1].replace(/[?&].*/, '') };
	}
	return !_.isEmpty(path_parts[0]) && !path_parts[0].match(/^(?:about|developer|explore|legal|press)$/) && { api: 'instagram', type: 'account', id: path_parts[0].replace(/[?&].*/, '') };
};

urls.represent = function(identity) {
	switch (identity.type) {
		case 'content':
			return ['https://instagram.com/p/' + identity.id + '/', 'https://instagr.am/p/' + identity.id + '/'];
		case 'account':
			return ['https://instagram.com/' + identity.id + '/', 'https://instagr.am/' + identity.id + '/'];
	}
};

module.exports = urls;
