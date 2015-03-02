/* global $ */
'use strict';

/* exported putButtons */
function putButtons(selector) {
    var videos = $(selector + ' iframe[src^="https://www.youtube.com/embed/"],' +
                   selector + ' iframe[src^="http://www.youtube.com/embed/"],' +
                   selector + ' object[data^="https://www.youtube.com/v/"],' +
                   selector + ' object[data^="http://www.youtube.com/v/"],' +
                   selector + ' embed[src^="https://www.youtube.com/v/"],' +
                   selector + ' embed[src^="http://www.youtube.com/v/"]');
    if (videos.length) {
        var buttons = $();
        videos.each(function() {
            var $this = $(this);
            var button = $('<div class="deckard-button"></div>').insertBefore($this);
            button.css('position', 'absolute');
            button.offset($this.offset());
            buttons = buttons.add(button);
        });
        chrome.runtime.sendMessage({ cmd: 'load_html', fileName: 'button.html' }, function(html) {
            buttons.html(html);
        });
    }
}
