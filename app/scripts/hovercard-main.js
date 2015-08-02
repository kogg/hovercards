var EXTENSION_ID = chrome.i18n.getMessage('@@extension_id');

window.addEventListener('message', function(event) {
    if (!event || !event.data) {
        return;
    }
    switch (event.data.msg) {
        case EXTENSION_ID + '-load':
            console.log('GOT SOMETHING', event.data);
            break;
    }
}, false);

window.parent.postMessage({ msg: EXTENSION_ID + '-hovercard-ready' }, '*');
