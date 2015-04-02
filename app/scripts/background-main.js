'use strict';

require(['trigger-background'], function(triggerBackground) {
    triggerBackground.init();
});

require(['notifications-background'], function(notificationsBackground) {
    notificationsBackground.init();
});

require(['omnibar-background'], function(omnibarBackground) {
    omnibarBackground.init();
});
