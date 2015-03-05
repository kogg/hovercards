'use strict';

(function() {
    require(['jquery', 'youtube-button'], function($, youtubeButton) {
        $('body').prepend(youtubeButton('body #player'));
    });
}());
