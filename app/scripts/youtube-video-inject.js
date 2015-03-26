'use strict';

/* FIXME Why do we have to name this within the file itself? */
define('youtube-video-inject', ['trigger'], function(trigger) {
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

    function injectTriggerOnIframePlayer(body, docURL) {
        /* globals purl:true */
        trigger(body.find('#player'), 'youtube-video', purl(docURL || document.URL).segment(-1));
    }

    function injectTriggersOnObjectsAndEmbeds(body) {
        body
            .find('object[data*="youtube.com/v/"], embed[src*="youtube.com/v/"]')
            .each(function() {
                /* globals purl:true */
                var video = $(this);
                trigger(video, 'youtube-video', purl(video.prop('data') || video.prop('src')).segment(-1).replace(/&.+/, ''));
            });
    }

    function inject(context, body) {
        if (!body) {
            body = 'body';
        }
        body = $(body);
        switch (context) {
            case 'default':
                inject.injectTriggersOnLinks(body);
                inject.injectTriggersOnObjectsAndEmbeds(body);
                break;
            case 'youtube-iframe':
                inject.injectTriggerOnIframePlayer(body);
                break;
            case 'facebook-youtube-iframe':
                inject.injectTriggersOnObjectsAndEmbeds(body);
                break;
        }
    }
    inject.injectTriggersOnLinks = injectTriggersOnLinks;
    inject.injectTriggerOnIframePlayer = injectTriggerOnIframePlayer;
    inject.injectTriggersOnObjectsAndEmbeds = injectTriggersOnObjectsAndEmbeds;

    return inject;
});
