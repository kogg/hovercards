if (parent.document.URL !== 'chrome-extension://' + chrome.i18n.getMessage('@@extension_id') + '/sidebar.html') {
    return;
}
var $ = require('jquery');

$(function() {
    $('body').append('<style>.multiSounds__list { bottom: 0; } .soundsList { z-index: 2; } .soundsList__inner { height: 118px; }</style>');
});
