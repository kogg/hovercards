'use strict';

/* exported putButtonOn */
/* global button */
function putButtonOn(area) {
    var videos = $(area).find('object[data*="youtube.com/v/"],' +
                               'embed[src*="youtube.com/v/"]');
    videos.each(function() {
        var video = $(this);
        var buttonObj = button(video);
        video.before(buttonObj);
    });
}
