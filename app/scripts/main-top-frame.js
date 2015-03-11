'use strict';

require(['sidebar'], function(sidebar) {
    sidebar().appendTo('body');
});
require(['youtube-inject'], function(youtubeInject) {
    youtubeInject('body');
});
