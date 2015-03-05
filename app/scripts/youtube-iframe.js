'use strict';

require(['jquery', 'youtube-button'], function($, youtubeButton) {
    $('body').prepend(youtubeButton('body #player'));
});
