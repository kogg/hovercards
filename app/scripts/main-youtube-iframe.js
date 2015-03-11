'use strict';

require(['youtube'], function() {
    require(['jquery', 'youtube-button'], function($, youtubeButton) {
        /* globals purl:true */
        $('body').prepend(youtubeButton('body #player', purl(document.URL).segment(-1)));
    });
});
