var $ = require('jquery');

var EXTENSION_ID = chrome.i18n.getMessage('@@extension_id');

var NameSpace = '.' + EXTENSION_ID;

var Cleanup = 'cleanup' + NameSpace;
var Click   = 'click' + NameSpace;

$('html').on(Click, '.' + EXTENSION_ID + '-hovercard:not(.' + EXTENSION_ID + '-modal)', function() {
    var hovercard = $(this);
    $.modal(hovercard.data('identity-' + EXTENSION_ID), hovercard);
});
