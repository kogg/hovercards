/* global $ */
'use strict';

/* exported putButtonOn */
/* global button */
function putButtonOn(selector) {
    var videos = $(selector + ' object[data*="youtube.com/v/"], ' +
                   selector + ' embed[src*="youtube.com/v/"]');
    videos.each(function() {
        $(this).before(button());
    });
}
