/* global $ */
/* exported wrapElements */
'use strict';

function wrapElements(selector) {
    $(selector + ' iframe[src^="https://www.youtube.com/embed/"]')
        .add(selector + ' object[data^="https://www.youtube.com/v/"]')
        .wrap('<div class="deckard_extension"></div>')
        .after('<div class="deckard_minimal"></div>');

    chrome.runtime.sendMessage({ cmd: 'load_html', fileName: 'minimal.html' }, function(html) {
        $(selector + ' .deckard_extension .deckard_minimal').html(html);
    });
}
