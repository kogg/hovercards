'use strict';

require(['jquery', 'sidebar'], function($, sidebar) {
    sidebar().appendTo('body');
});
require(['jquery', 'youtube-button'], function($, youtubeButton) {
    $('body').find('object[data*="youtube.com/v/"], embed[src*="youtube.com/v/"]')
        .each(function() {
            /* globals purl:true */
            var video = $(this);
            youtubeButton(video, purl(video.prop('data') || video.prop('src')).segment(-1)).insertBefore(video);
        });
});
