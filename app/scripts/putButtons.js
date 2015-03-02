/* global $ */
/* exported putButtons */
'use strict';

function putButtons(selector) {
    var videos = $(selector + ' iframe[src^="https://www.youtube.com/embed/"],' +
                   selector + ' iframe[src^="http://www.youtube.com/embed/"],' +
                   selector + ' object[data^="https://www.youtube.com/v/"],' +
                   selector + ' object[data^="http://www.youtube.com/v/"],' +
                   selector + ' embed[src^="https://www.youtube.com/v/"],' +
                   selector + ' embed[src^="http://www.youtube.com/v/"]');
    if (videos.length) {
        var buttons = $('<div class="deckard-button"></div>').insertBefore(videos);
        chrome.runtime.sendMessage({ cmd: 'load_html', fileName: 'minimal.html' }, function(html) {
            buttons.html(html);
        });
    }

}
