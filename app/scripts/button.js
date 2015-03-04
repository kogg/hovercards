'use strict';

/* exported button */
function button(video) {
    var buttonObj = $('<div class="deckard-button"></div>');
    video = $(video);

    buttonObj.offset(video.offset());
    $(buttonObj).add(video).hover(function() {
        buttonObj.css('opacity', 1);
    }, function() {
        buttonObj.css('opacity', 0);
    });

    chrome.runtime.sendMessage({ cmd: 'load_html', fileName: 'button.html' }, function(html) {
        buttonObj.html(html);
    });

    return buttonObj;
}
