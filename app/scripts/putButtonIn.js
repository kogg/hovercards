/* global $ */
'use strict';

/* exported putButtonIn */
function putButtonIn(selector) {
    $(selector).prepend('<div class="deckard-button"></div>');
}
