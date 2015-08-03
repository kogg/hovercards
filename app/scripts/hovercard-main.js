var $ = require('jquery');

var network_urls = require('YoCardsApiCalls/network-urls');

var EXTENSION_ID = chrome.i18n.getMessage('@@extension_id');

window.addEventListener('message', function(event) {
    if (!event || !event.data) {
        return;
    }
    switch (event.data.msg) {
        case EXTENSION_ID + '-load':
            $(document).off('click');
            $(document).on('click', function() {
                window.parent.postMessage({ msg: EXTENSION_ID + '-hovercard-clicked', url: network_urls.generate(event.data.identity) }, '*');
            });
            break;
    }
}, false);

window.parent.postMessage({ msg: EXTENSION_ID + '-hovercard-ready' }, '*');
