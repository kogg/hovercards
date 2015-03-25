'use strict';

require(['sidebar', 'youtube-video'], function(sidebar, youtubeVideo) {
    sidebar.inject('default');
    youtubeVideo.inject('default');
});
