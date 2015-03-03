'use strict';

/* exported button */
function button(video) {
    var buttonObj = $('<div class="deckard-button"></div>');
    video = $(video);

    $(buttonObj).add(video).hover(function() {
        buttonObj.show();
        buttonObj.offset(video.offset());
    }, function() {
        buttonObj.hide();
    });

    chrome.runtime.sendMessage({ cmd: 'load_html', fileName: 'button.html' }, function(html) {
        buttonObj.html(html);
    });

    return buttonObj;
}
