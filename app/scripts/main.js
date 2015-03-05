'use strict';

(function() {
    /* global sidebar */
    sidebar.putInElement('body');
    require(['youtube-button'], function(youtubeButton) {
        youtubeButton.putOnVideos('body');
    });
}());
