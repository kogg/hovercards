if (window === window.top) {
	return;
}
var $ = require('jquery');
require('./common');

var EXTENSION_ID = chrome.i18n.getMessage('@@extension_id');

var NameSpace = '.' + EXTENSION_ID;

var Click = 'click' + NameSpace;

$.lightbox = function(identity) {
	window.top.postMessage({ msg: EXTENSION_ID + '-lightbox', identity: identity }, '*');
};

$('html').on(Click, '.' + EXTENSION_ID + '-hovercard:not(.' + EXTENSION_ID + '-lightbox)', function() {
	$(this).remove();
});
