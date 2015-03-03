'use strict';

/* exported button */
function button() {
    var buttonObj = $('<div class="deckard-button"></div>');
    chrome.runtime.sendMessage({ cmd: 'load_html', fileName: 'button.html' }, function(html) {
        buttonObj.html(html);
    });

    return buttonObj;
}
