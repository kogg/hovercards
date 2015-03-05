'use strict';

require(['jquery', 'sidebar'], function($, sidebar) {
    $('body').prepend(sidebar());
});
require(['youtube-button'], function(youtubeButton) {
    youtubeButton.disperseThroughout('body');
});
