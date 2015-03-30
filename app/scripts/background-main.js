'use strict';

require(['trigger-background'], function(triggerBackground) {
    triggerBackground.init();
});

require(['notifications-background'], function(notificationsBackground) {
    notificationsBackground.init();
});

require(['youtube-background'], function(youtubeBackground) {
    youtubeBackground.init();
});
