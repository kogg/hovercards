'use strict';

define(['angular-app', 'jquery'], function(app, $) {
    app.directive('cards', function() {
        return {
            scope: {
                cardsets: '=cards'
            },
            link: function($scope) {
                $scope.cardsets = [];
                chrome.runtime.onMessage.addListener(function(request) {
                    switch (request.msg) {
                        case 'hide':
                            $scope.$apply(function() {
                                $scope.cardsets = [];
                            });
                            break;
                        case 'load':
                            $scope.$apply(function() {
                                $scope.cardsets = [[]];
                            });
                            $.ajax('https://hovercards.herokuapp.com/v1/' + request.provider + '/' + request.content + '/' + request.id)
                                .done(function(response) {
                                    $scope.$apply(function() {
                                        $scope.cardsets = [response];
                                    });
                                });
                            break;
                    }
                });
            }
        };
    });
});
