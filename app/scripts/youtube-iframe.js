'use strict';

(function() {
    require(['youtube-button', 'jquery'], function(youtubeButton, $) {
        $('body').prepend(youtubeButton('body #player'));
    });
}());
