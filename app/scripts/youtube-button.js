'use strict';

define('youtube-button', ['jquery', 'trigger'], function($, trigger) {
    function youtubeButton(video, youtubeId) {
        var timeout;
        video = $(video);

        var button = trigger('<div></div>', 'youtube', youtubeId)
            .addClass('deckard-youtube-button')
            .append($('<div></div>').addClass('deckard-youtube-button-inner'))
            .mouseenter(function() {
                button
                    .stop(true, true).css('opacity', 1)
                    .offset(video.offset());
                clearTimeout(timeout);
            })
            .mouseleave(function() {
                button.stop(true, true).css('opacity', 0);
                clearTimeout(timeout);
            });

        video
            .mouseenter(function() {
                button
                    .stop(true, true).css('opacity', 1)
                    .offset(video.offset());
                timeout = setTimeout(function() {
                    button.stop(true, true).fadeTo(500, 0);
                }, 2000);
            })
            .mouseleave(function() {
                button.stop(true, true).css('opacity', 0);
                clearTimeout(timeout);
            });

        return button;
    }

    return youtubeButton;
});
