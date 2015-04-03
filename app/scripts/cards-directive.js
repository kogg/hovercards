'use strict';

define(['angular-app', 'jquery', 'oboe'], function(app, $, oboe) {
    app.directive('cards', function() {
        return {
            scope: {
                cardsets: '=cards'
            },
            link: function($scope) {
                $scope.cardsets = [];
                var abortLast = function() {};
                chrome.runtime.onMessage.addListener(function(request) {
                    switch (request.msg) {
                        case 'hide':
                            abortLast();
                            abortLast = function() {};
                            $scope.$apply(function() {
                                $scope.cardsets = [];
                            });
                            break;
                        case 'load':
                            abortLast();
                            $scope.$apply(function() {
                                $scope.cardsets = [[]];
                            });
                            abortLast = oboe('https://hovercards.herokuapp.com/v1/node/' + request.provider + '-' + request.content + '/type/id/value/' + request.id)
                                .node('!', function(card) {
                                    $scope.$apply(function() {
                                        if (!$scope.cardsets[0]) {
                                            return;
                                        }
                                        $scope.cardsets[0].push(card);
                                    });
                                    return oboe.drop;
                                }).abort;
                            break;
                    }
                });
            }
        };
    });
});
