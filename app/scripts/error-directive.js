'use strict';

define('error-directive', ['angular-app'], function(app) {
    app.directive('error', function() {
        return {
            transclude: true,
            templateUrl: 'templates/error.html'
        };
    });
});

