var _ = require('underscore');

var EXTENSION_ID = chrome.i18n.getMessage('@@extension_id');

_.mixin({
	analytics_label: function(identity) {
		return _.chain([identity.api, identity.type])
		        .compact()
		        .union(identity.as && ['as', identity.as])
		        .union(identity['for'] && ['for', _.analytics_label(identity['for'])])
		        .value()
		        .join(' ');
	},
	prefix: function(className) {
		return EXTENSION_ID + '-' + className;
	}
});
