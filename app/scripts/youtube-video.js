'use strict';

define('youtube-video', ['trigger'], function(trigger) {
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
                trigger(video, 'youtube-video', purl(video.prop('data') || video.prop('src')).segment(-1).replace(/&.+/, ''));
            });
    }
    youtubeVideo.injectTriggersOnObjectsAndEmbeds = injectTriggersOnObjectsAndEmbeds;

    function inject(context, body) {
        if (!body) {
            body = 'body';
        }
        body = $(body);
        switch (context) {
            case 'default':
                youtubeVideo.injectTriggersOnLinks(body);
                youtubeVideo.injectTriggersOnObjectsAndEmbeds(body);
                break;
            case 'youtube-iframe':
                youtubeVideo.injectTriggerOnIframePlayer(body);
                break;
            case 'facebook-youtube-iframe':
                youtubeVideo.injectTriggersOnObjectsAndEmbeds(body);
                break;
        }
    }
    youtubeVideo.inject = inject;

    return youtubeVideo;
});
