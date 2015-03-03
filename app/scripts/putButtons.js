/* global $ */
'use strict';

var hasButton = $();

/* exported putButtons */
function putButtons(selector) {
    var videos = $(selector + ' iframe[src*="youtube.com/embed/"], ' +
                   selector + ' iframe[src*="cdn.embedly.com/"][src*="schema=youtube"], ' +
                   selector + ' object[data*="youtube.com/v/"], ' +
                   selector + ' embed[src*="youtube.com/v/"]').not(hasButton);
    if (videos.length) {
        var buttons = $();
        videos.each(function() {
            var $this = $(this);
            var button = $('<div class="deckard-button"></div>').insertBefore($this);
            button.css('position', 'absolute');
            button.offset($this.offset());
            buttons = buttons.add(button);
            $(window).resize(function() {
                button.offset($this.offset());
            });
        });
        chrome.runtime.sendMessage({ cmd: 'load_html', fileName: 'button.html' }, function(html) {
            buttons.html(html);
        });
        hasButton = hasButton.add(videos);
    }
}
