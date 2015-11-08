var $ = require('jquery');
var _ = require('underscore');

require('../common/mixins');

var EXTENSION_ID = chrome.i18n.getMessage('@@extension_id');

var NameSpace = '.' + EXTENSION_ID;

var Click = 'click' + NameSpace;

$('html').on(Click, '.' + _.prefix('hovercard__box'), function() {
	var hovercard = $(this).parents('.' + _.prefix('hovercard'));
	$.lightbox(hovercard.data(EXTENSION_ID + '-identity'), hovercard);
});
