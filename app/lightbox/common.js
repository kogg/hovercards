var $ = require('jquery');
var _ = require('underscore');

require('../mixins');

var EXTENSION_ID = chrome.i18n.getMessage('@@extension_id');

var NameSpace = '.' + EXTENSION_ID;

var Click = 'click' + NameSpace;

$('html').on(Click, '.' + _.prefix('hovercard') + ':not(.' + _.prefix('lightbox') + ')', function() {
	var hovercard = $(this);
	$.lightbox(hovercard.data(EXTENSION_ID + '-identity'), hovercard);
});
