var _ = require('underscore');

var EXTENSION_ID = chrome.i18n.getMessage('@@extension_id');

_.mixin({
	prefix: function(className) {
		return EXTENSION_ID + '-' + className;
	}
});
