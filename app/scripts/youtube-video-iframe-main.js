'use strict';

require(['hover-trigger'], function(hoverTrigger) {
    hoverTrigger.handle('body', 'youtube-video', '#player', function() {
        /* globals purl:true */
        return purl(document.URL).segment(-1);
    });
});
