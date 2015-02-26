/* global $ */
/* exported wrapElements */
'use strict';

function wrapElements(selector) {
    $(selector + ' iframe').wrap('<div class="deckard_extension"></div>');
}
