'use strict';

define('youtube-video-button', ['jquery', 'trigger'], function($, trigger) {
    return function youtubeVideoButton(video, youtubeId) {
        var timeout;
        video = $(video);

        var button = trigger('<div></div>', 'youtube-video', youtubeId)
            .addClass('hovertoast-youtube-video-button')
            .append($('<div></div>').addClass('hovertoast-youtube-video-button-inner'))
            .click(function() {
                chrome.runtime.sendMessage({ msg: 'interested' });
            })
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
    };
});
