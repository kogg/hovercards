'use strict';

define('youtube-video', ['injector', 'trigger'], function(injector, trigger) {
    var youtubeVideo = {};

    function injectTriggersOnLinks(body, docURL) {
        /* globals purl:true */
        if (!docURL) {
            docURL = document.URL;
        }
        var youtubeLinkSelector = 'a[href*="youtube.com/watch"]';
        if (purl(docURL).attr('host') === 'www.youtube.com') {
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

    function injectButtonOnPlayer() {
    }
    youtubeVideo.injectButtonOnPlayer = injectButtonOnPlayer;

    function injectButtonsOnObjectsAndEmbeds() {
    }
    youtubeVideo.injectButtonsOnObjectsAndEmbeds = injectButtonsOnObjectsAndEmbeds;

    function registerInjections() {
        injector.register('default',                 youtubeVideo.injectTriggersOnLinks);
        injector.register('default',                 youtubeVideo.injectButtonsOnObjectsAndEmbeds);
        injector.register('youtube-iframe',          youtubeVideo.injectButtonOnPlayer);
        injector.register('facebook-youtube-iframe', youtubeVideo.injectButtonsOnObjectsAndEmbeds);
    }
    youtubeVideo.registerInjections = registerInjections;

    return youtubeVideo;
});
