var $ = require('jquery');

var EXTENSION_ID = chrome.i18n.getMessage('@@extension_id');

var NameSpace = '.' + EXTENSION_ID;

var Cleanup = 'cleanup' + NameSpace;
var Click   = 'click' + NameSpace;

$('html').on(Click, '.' + EXTENSION_ID + '-hovercard:not(.' + EXTENSION_ID + '-lightbox)', function() {
    var hovercard = $(this);
    $.lightbox(hovercard.data('identity-' + EXTENSION_ID), hovercard);
});
