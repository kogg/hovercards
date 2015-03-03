'use strict';

/* exported putButtonIn */
/* global button */
function putButtonIn(video) {
    var buttonObj = button(video);

    $(video).prepend(buttonObj);
}
