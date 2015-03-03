'use strict';

/* exported putButtonOn */
/* global button */
function putButtonOn(selector) {
    var videos = $(selector + ' object[data*="youtube.com/v/"], ' +
                   selector + ' embed[src*="youtube.com/v/"]');
    videos.each(function() {
        var buttonObj = button();
        var video = $(this);
        video.before(buttonObj);

        video.hover(function() {
            buttonObj.show();
            buttonObj.offset(video.offset());
        }, function() {
            buttonObj.hide();
        });

        // FIXME I don't like this!!
        buttonObj.hover(function() {
            $(this).show();
            $(this).offset(video.offset());
        }, function() {
            $(this).hide();
        });
    });
}
