'use strict';

(function() {
    require(['sidebar', 'youtube-button'], function(sidebar, youtubeButton) {
        sidebar.putInElement('body');
        youtubeButton.putOnVideos('body');
    });
}());
