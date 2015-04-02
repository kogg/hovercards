'use strict';

define(['angular-app', 'jquery'], function(app, $) {
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
                        case 'load':
                            $.ajax('https://hovercards.herokuapp.com/v1/' + request.provider + '/' + request.content + '/' + request.id)
                                .done(function(response) {
                                    $scope.$apply(function() {
                                        $scope.cards = response;
                                    });
                                });
                            break;
                    }
                });
            }
        };
    });
});
