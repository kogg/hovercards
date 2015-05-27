var $ = require('jquery');

var container = $('<div></div>')
    .appendTo('html')
    .addClass(chrome.i18n.getMessage('@@extension_id') + '-container');

require('./sidebar')(container, function(msg) {
    window.postMessage(msg, '*');
});
