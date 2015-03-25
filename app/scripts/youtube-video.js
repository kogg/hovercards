'use strict';

define('youtube-video', ['injector', 'trigger'], function(injector, trigger) {
    var youtubeVideo = {};

    function injectTriggersOnLinks(body, docURL) {
        /* globals purl:true */
        var youtubeLinkSelector = 'a[href*="youtube.com/watch"]';
        if (purl(docURL || document.URL).attr('host') === 'www.youtube.com') {
            youtubeLinkSelector += ',a[href^="/watch"]';
        }
        body
            .find(youtubeLinkSelector)
            .each(function() {
                var link = $(this);
                trigger(link, 'youtube-video', purl(link.attr('href')).param('v'));
            });
        body
            .find('a[href*="youtu.be/"]')
            .each(function() {
                var link = $(this);
                trigger(link, 'youtube-video', purl(link.attr('href')).segment(-1));
            });
    }
    youtubeVideo.injectTriggersOnLinks = injectTriggersOnLinks;

    function injectTriggerOnIframePlayer(body, docURL) {
        /* globals purl:true */
        trigger(body.find('#player'), 'youtube-video', purl(docURL || document.URL).segment(-1));
    }
    youtubeVideo.injectTriggerOnIframePlayer = injectTriggerOnIframePlayer;

    function injectTriggersOnObjectsAndEmbeds(body) {
        body
            .find('object[data*="youtube.com/v/"], embed[src*="youtube.com/v/"]')
            .each(function() {
                /* globals purl:true */
                var video = $(this);
                trigger(video, 'youtube-video', purl(video.prop('data') || video.prop('src')).segment(-1));
            });
    }
    youtubeVideo.injectTriggersOnObjectsAndEmbeds = injectTriggersOnObjectsAndEmbeds;

    function registerInjections() {
        injector.register('default',                 youtubeVideo.injectTriggersOnLinks);
        injector.register('default',                 youtubeVideo.injectTriggersOnObjectsAndEmbeds);
        injector.register('youtube-iframe',          youtubeVideo.injectTriggerOnIframePlayer);
        injector.register('facebook-youtube-iframe', youtubeVideo.injectTriggersOnObjectsAndEmbeds);
    }
    youtubeVideo.registerInjections = registerInjections;

    return youtubeVideo;
});
