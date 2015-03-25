'use strict';

define('youtube-video', ['injector'], function(injector) {
    var youtubeVideo = {};

    function injectButtonOnPlayer() {
    }
    youtubeVideo.injectButtonOnPlayer = injectButtonOnPlayer;

    function injectTriggersOnLinks() {
    }
    youtubeVideo.injectTriggersOnLinks = injectTriggersOnLinks;

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
