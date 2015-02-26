/* global $ */
/* exported wrapElements */
'use strict';

function wrapElements(selector) {
    $(selector + ' iframe[src^="https://www.youtube.com/embed/"]').wrap('<div class="deckard_extension"></div>');
}
