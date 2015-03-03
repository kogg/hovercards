'use strict';

/* exported putButtonIn */
/* global button */
function putButtonIn(selector) {
    $(selector).prepend(button());
}
