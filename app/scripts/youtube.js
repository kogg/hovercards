'use strict';

define('youtube', ['jquery'], function($) {
    function inject(body, context) {
        if (!body) {
            body = 'body';
        }
        body = $(body);
        switch (context) {
            case 'youtube iframe':
                require(['youtube-button'], function(youtubeButton) {
                    /* globals purl:true */
                    youtubeButton(body.children('#player'), purl(document.URL).segment(-1)).prependTo(body);
                });
                break;
            default:
                require(['youtube-button'], function(youtubeButton) {
                    body
                        .find('object[data*="youtube.com/v/"], embed[src*="youtube.com/v/"]')
                        .each(function() {
                            /* globals purl:true */
                            var video = $(this);
                            youtubeButton(video, purl(video.prop('data') || video.prop('src')).segment(-1)).insertBefore(video);
                        });
                });
                require(['trigger'], function(trigger) {
                    var youtubeLinkSelector = 'a[href*="youtube.com/watch"]';
                    if (purl(document.URL).attr('host') === 'www.youtube.com') {
                        youtubeLinkSelector += ',a[href^="/watch"]';
                    }
                    body
                        .find(youtubeLinkSelector)
                        .each(function() {
                            /* globals purl:true */
                            var link = $(this);
                            trigger(link, 'youtube', purl(link.attr('href')).param('v'));
                        });
                });
                break;
        }
    }

    return { inject: inject };
});
