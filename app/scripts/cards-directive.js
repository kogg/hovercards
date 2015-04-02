'use strict';

define(['angular-app'], function(app) {
    app.directive('cards', function() {
        return {
            scope: { },
            link: function($scope) {
                $scope.cards = [];
                chrome.runtime.onMessage.addListener(function(request) {
                    switch (request.msg) {
                        case 'hide':
                            $scope.$apply(function() {
                                $scope.cards = [];
                            });
                            break;
                    }
                });
            }
        };
    });
});
