if (window !== window.top) {
	var $ = require('jquery');
	var _ = require('underscore');
	require('../common/mixins');
	require('./both');

	var EXTENSION_ID = chrome.i18n.getMessage('@@extension_id');

	var NameSpace = '.' + EXTENSION_ID;

	var Click = 'click' + NameSpace;

	$.lightbox = function(identity) {
		window.top.postMessage({ msg: _.prefix('lightbox'), identity: identity }, '*');
	};

	$('html').on(Click, '.' + _.prefix('hovercard__box'), function() {
		$(this).parents('.' + _.prefix('hovercard')).remove();
	});
}
