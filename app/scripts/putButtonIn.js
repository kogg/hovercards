'use strict';

/* exported putButtonIn */
/* global button */
function putButtonIn(selector) {
    var buttonObj = button();

    $(selector).prepend(buttonObj);

    $(selector).hover(function() {
        buttonObj.show();
    }, function() {
        buttonObj.hide();
    });
}
