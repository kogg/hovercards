'use strict';

require(['jquery', 'sidebar'], function($, sidebar) {
    sidebar().appendTo('body');
});
require(['youtube'], function() {
    require(['jquery', 'youtube-button'], function($, youtubeButton) {
        $('body')
            .find('object[data*="youtube.com/v/"], embed[src*="youtube.com/v/"]')
            .each(function() {
                /* globals purl:true */
                var video = $(this);
                youtubeButton(video, purl(video.prop('data') || video.prop('src')).segment(-1)).insertBefore(video);
            });
    });
    require(['jquery', 'trigger'], function($, trigger) {
        var youtubeLinkSelector = 'a[href*="youtube.com/watch"]';
        if (purl(document.URL).attr('host') === 'www.youtube.com') {
            youtubeLinkSelector += ',a[href^="/watch"]';
        }
        $('body')
            .find(youtubeLinkSelector)
            .each(function() {
                /* globals purl:true */
                var link = $(this);
                trigger(link, 'youtube', purl(link.attr('href')).param('v'));
            });
    });
});
