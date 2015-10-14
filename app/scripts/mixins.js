var _ = require('underscore');

var EXTENSION_ID = chrome.i18n.getMessage('@@extension_id');

_.mixin({
	class: function(className) {
		return EXTENSION_ID + '-' + className;
	}
});
