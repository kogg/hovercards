/* global $ */
/* exported wrapElements */
'use strict';

function wrapElements(selector) {
    $()
        .add(selector + ' iframe[src^="https://www.youtube.com/embed/"]')
        .add(selector + ' iframe[src^="http://www.youtube.com/embed/"]')
        .add(selector + ' object[data^="https://www.youtube.com/v/"]')
        .add(selector + ' object[data^="http://www.youtube.com/v/"]')
        .add(selector + ' embed[src^="https://www.youtube.com/v/"]')
        .add(selector + ' embed[src^="http://www.youtube.com/v/"]')
        .wrap('<div class="deckard-extension"></div>')
        .after('<div class="deckard-minimal"></div>')
        .each(function() {
            $(this).parent().css('width', $(this).css('width'));
        });

    chrome.runtime.sendMessage({ cmd: 'load_html', fileName: 'minimal.html' }, function(html) {
        $(selector + ' .deckard-extension .deckard-minimal').html(html);
    });
}
