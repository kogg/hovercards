'use strict';

define('youtube-button', ['jquery', 'trigger'], function($, trigger) {
    function youtubeButton(video, youtubeId) {
        var timeout;
        video = $(video);

        var button = trigger('<div></div>', 'youtube', youtubeId)
            .addClass('deckard-youtube-button')
            .offset(video.offset())
            .append($('<div></div>').addClass('deckard-youtube-button-inner'))
            .mouseenter(function() {
                button.stop(true, true).css('opacity', 1);
                clearTimeout(timeout);
            })
            .mouseleave(function() {
                button.stop(true, true).css('opacity', 0);
                clearTimeout(timeout);
            });

        video
            .mouseenter(function() {
                button.stop(true, true).css('opacity', 1);
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

    function disperseThroughout(area) {
        var videos = $(area).find('object[data*="youtube.com/v/"],' +
                                  'embed[src*="youtube.com/v/"]');
        videos.each(function() {
            var video = $(this);
            var id = (video.prop('data') || video.prop('src')).match(/\(?(?:(https?):\/\/)?(?:((?:[^\W\s]|\.|-|[:]{1})+)@{1})?((?:www.)?(?:[^\W\s]|\.|-)+[\.][^\W\s]{2,4}|localhost(?=\/)|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(?::(\d*))?([\/]?[^\s\?]*[\/]{1})*(?:\/?([^\s\n\?\[\]\{\}\#]*(?:(?=\.)){1}|[^\s\n\?\[\]\{\}\.\#]*)?([\.]{1}[^\s\?\#]*)?)?(?:\?{1}([^\s\n\#\[\]]*))?([\#][^\s\n]*)?\)?/);
            if (id) { id = id[6]; }
            video.before(youtubeButton(video, id));
        });
    }

    youtubeButton.disperseThroughout = disperseThroughout;

    return youtubeButton;
});
