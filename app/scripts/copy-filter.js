'use strict';

define(['angular-app'], function(app) {
    return app.filter('copy', function() {
        return function(messagename) {
            return chrome.i18n.getMessage(messagename.replace(/\-/g, '_'));
        };
    });
});
