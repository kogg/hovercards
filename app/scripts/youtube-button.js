'use strict';

/* exported youtubeButton */
var youtubeButton = (function() {
    function build(video) {
        var button = $('<div class="deckard-button"></div>');
        video = $(video);

        var timeout;

        button.offset(video.offset());
        $(button).hover(function() {
            button.css('opacity', 1);
            clearTimeout(timeout);
        }, function() {
            button.css('opacity', 0);
            clearTimeout(timeout);
        });

        video.hover(function() {
            button.css('opacity', 1);
            timeout = setTimeout(function() {
                button.css('opacity', 0);
            }, 1000);
        }, function() {
            button.css('opacity', 0);
            clearTimeout(timeout);
        });

        chrome.runtime.sendMessage({ cmd: 'load_html', fileName: 'button.html' }, function(html) {
            button.html(html);
        });

        return button;
    }

    function putInVideo(video) {
        var button = build(video);

        $(video).prepend(button);
    }

    function putOnVideos(area) {
        var videos = $(area).find('object[data*="youtube.com/v/"],' +
                                   'embed[src*="youtube.com/v/"]');
        videos.each(function() {
            var video = $(this);
            var button = build(video);
            video.before(button);
        });
    }

    return {
        build: build,
        putInVideo: putInVideo,
        putOnVideos: putOnVideos
    };
}());
