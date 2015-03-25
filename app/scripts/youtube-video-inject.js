'use strict';

define('youtube-video-inject', ['jquery', 'youtube-video-button'], function($, youtubeVideoButton) {
    function injectButtonOnPlayer(body, docURL) {
        /* globals purl:true */
        youtubeVideoButton(body.children('#player'), purl(docURL).segment(-1)).prependTo(body);
    }

    function injectButtonsOnObjectsAndEmbeds(body) {
        body
            .find('object[data*="youtube.com/v/"], embed[src*="youtube.com/v/"]')
            .each(function() {
                /* globals purl:true */
                var video = $(this);
                youtubeVideoButton(video, purl(video.prop('data') || video.prop('src')).segment(-1)).insertBefore(video);
            });
    }

    function youtubeVideoInject(body, context, docURL) {
        if (!body) {
            body = 'body';
        }
        if (!docURL) {
            docURL = document.URL;
        }
        body = $(body);
        switch (context) {
            case '#player':
                youtubeVideoInject.injectButtonOnPlayer(body, docURL);
                break;
            case 'objects':
                youtubeVideoInject.injectButtonsOnObjectsAndEmbeds(body);
                break;
            default:
                youtubeVideoInject.injectButtonsOnObjectsAndEmbeds(body);
                break;
        }
    }

    youtubeVideoInject.injectButtonOnPlayer            = injectButtonOnPlayer;
    youtubeVideoInject.injectButtonsOnObjectsAndEmbeds = injectButtonsOnObjectsAndEmbeds;

    return youtubeVideoInject;
});
