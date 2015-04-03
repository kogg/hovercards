'use strict';

define(['angular-app'], function(app) {
    app.directive('card', function() {
        return {
            scope: {
                provider: '@',
                content:  '@',
                id:       '=',
                object:   '='
            },
            templateUrl: 'templates/card.html',
        };
    });
});
