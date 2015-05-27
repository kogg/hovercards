var $ = require('jquery');

var container = $('<div></div>')
    .appendTo('html')
    .addClass(chrome.i18n.getMessage('@@extension_id') + '-container');

require('./sidebar')()
    .appendTo(container);
