'use strict';

define(['angular-app'], function(app) {
    app.filter('trustresourceurl', ['$sce', function($sce) {
        return function(url) {
            return $sce.trustAsResourceUrl(url);
        };
    }]);
});
