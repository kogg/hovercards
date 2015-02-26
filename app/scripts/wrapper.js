/* global $ */
/* exported wrapElements */
'use strict';

function wrapElements(selector, runtime) {
    $(selector + ' iframe[src^="https://www.youtube.com/embed/"]')
        .wrap('<div class="deckard_extension"></div>')
        .after('<div class="deckard_minimal"></div>');

    if (!runtime) { runtime = chrome.runtime; }
    runtime.sendMessage({ cmd: 'load_html', fileName: 'minimal.html' }, function(html) {
        $(selector + ' .deckard_extension .deckard_minimal').html(html);
    });
}
