'use strict';

(function() {
    require(['jquery', 'sidebar', 'youtube-button'], function($, sidebar, youtubeButton) {
        $('body').prepend(sidebar());
        youtubeButton.disperseThroughout('body');
    });
}());
