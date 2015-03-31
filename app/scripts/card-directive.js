'use strict';

define(['angular-app'], function(app) {
    app.directive('card', function() {
        return {
            scope: {
                provider: '@',
                content:  '@',
                id:       '=contentId',
                object:   '=object'
            },
            templateUrl: 'templates/card.html',
        };
    });
});
