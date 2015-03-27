'use strict';

$(document).keydown(function(e) {
    if (e.which !== 16) {
        return;
    }
    chrome.runtime.sendMessage({ msg: 'undeck' });
});
