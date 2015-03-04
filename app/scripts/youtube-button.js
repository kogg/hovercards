'use strict';

/* exported button */
function button(video) {
    var buttonObj = $('<div class="deckard-button"></div>');
    video = $(video);

    var timeout;

    buttonObj.offset(video.offset());
    $(buttonObj).hover(function() {
        buttonObj.css('opacity', 1);
        clearTimeout(timeout);
    }, function() {
        buttonObj.css('opacity', 0);
        clearTimeout(timeout);
    });

    video.hover(function() {
        buttonObj.css('opacity', 1);
        timeout = setTimeout(function() {
            buttonObj.css('opacity', 0);
        }, 1000);
    }, function() {
        buttonObj.css('opacity', 0);
        clearTimeout(timeout);
    });

    chrome.runtime.sendMessage({ cmd: 'load_html', fileName: 'button.html' }, function(html) {
        buttonObj.html(html);
    });

    return buttonObj;
}

/* exported putButtonIn */
function putButtonIn(video) {
    var buttonObj = button(video);

    $(video).prepend(buttonObj);
}

/* exported putButtonOn */
function putButtonOn(area) {
    var videos = $(area).find('object[data*="youtube.com/v/"],' +
                               'embed[src*="youtube.com/v/"]');
    videos.each(function() {
        var video = $(this);
        var buttonObj = button(video);
        video.before(buttonObj);
    });
}
