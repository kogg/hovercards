var $ = require('jquery');

var EXTENSION_ID = chrome.i18n.getMessage('@@extension_id');

var NameSpace = '.' + EXTENSION_ID;

var MouseMove = 'mousemove' + NameSpace + ' mouseenter' + NameSpace;

module.exports = function(selector, get_url) {
    if (document.URL.match(/[&?]noyo=1/)) {
        return;
    }
    $('html').on(MouseMove, selector, function(e) {
        var obj = $(this);
        console.log('hey', get_url(obj));
    });
};
