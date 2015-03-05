'use strict';

define('youtube-button', ['jquery'], function($) {
    function youtubeButton(video) {
        var button = $('<div class="deckard-youtube-button"></div>').append('<div class="deckard-youtube-button-inner"></div>');
        video = $(video);

        var timeout;

        button.offset(video.offset());
        button.hover(function() {
            button.stop(true, true).css('opacity', 1);
            chrome.runtime.sendMessage({ msg: 'info', key: 'youtube' });
            clearTimeout(timeout);
        }, function() {
            button.stop(true, true).css('opacity', 0);
            chrome.runtime.sendMessage({ msg: 'interest', key: 'confidence', value: 'unsure' });
            clearTimeout(timeout);
        });
        button.click(function() {
            chrome.runtime.sendMessage({ msg: 'interest', key: 'confidence', value: 'sure' });
        });

        video.hover(function() {
            button.stop(true, true).css('opacity', 1);
            timeout = setTimeout(function() {
                button.stop(true, true).fadeTo(500, 0);
            }, 2000);
        }, function() {
            button.stop(true, true).css('opacity', 0);
            clearTimeout(timeout);
        });

        return button;
    }

    function disperseThroughout(area) {
        var videos = $(area).find('object[data*="youtube.com/v/"],' +
                                  'embed[src*="youtube.com/v/"]');
        videos.each(function() {
            var video = $(this);
            var button = youtubeButton(video);
            video.before(button);
        });
    }

    youtubeButton.disperseThroughout = disperseThroughout;

    return youtubeButton;
});
