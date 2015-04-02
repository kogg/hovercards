'use strict';

define(['angular-app'], function(app) {
    app.directive('cards', function() {
        return {
            scope: { },
            link: function($scope) {
                $scope.cards = [];
            }
        };
    });
});
