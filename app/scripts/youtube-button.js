'use strict';

define('youtube-button', ['jquery'], function($) {
    function youtubeButton(id, video) {
        var timeout;
        video = $(video);

        var button = $('<div></div>')
            .addClass('deckard-youtube-button')
            .offset(video.offset())
            .append($('<div></div>').addClass('deckard-youtube-button-inner'))
            .data('id', id)
            .click(function() {
                chrome.runtime.sendMessage({ msg: 'interest', key: 'confidence', value: 'sure' });
            })
            .mouseenter(function() {
                button.stop(true, true).css('opacity', 1);
                chrome.runtime.sendMessage({ msg: 'info', key: 'youtube' });
                clearTimeout(timeout);
            })
            .mouseleave(function() {
                button.stop(true, true).css('opacity', 0);
                chrome.runtime.sendMessage({ msg: 'interest', key: 'confidence', value: 'unsure' });
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
            video
                .before(youtubeButton(id, video));
        });
    }

    youtubeButton.disperseThroughout = disperseThroughout;

    return youtubeButton;
});
