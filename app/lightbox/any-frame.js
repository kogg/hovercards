if (window === window.top) {
	return;
}
var $ = require('jquery');
var _ = require('underscore');
require('../mixins');
require('./common');

var EXTENSION_ID = chrome.i18n.getMessage('@@extension_id');

var NameSpace = '.' + EXTENSION_ID;

var Click = 'click' + NameSpace;

$.lightbox = function(identity) {
	window.top.postMessage({ msg: _.prefix('lightbox'), identity: identity }, '*');
};

$('html').on(Click, '.' + _.prefix('hovercard') + ':not(.' + _.prefix('lightbox') + ')', function() {
	$(this).remove();
});
