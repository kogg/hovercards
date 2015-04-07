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
                                $scope.cardsets = [{ cards: [], errors: [] }];
                            });
                            abortLast = oboe('https://hovercards.herokuapp.com/v1/cards?' + decodeURIComponent($.param({ url: request.url })))
                                .node('!', function(card) {
                                    if (!$scope.cardsets[0] || !card.type) {
                                        return;
                                    }
                                    $scope.$apply(function() {
                                        if (card.type !== 'error') {
                                            $scope.cardsets[0].cards.push(card);
                                        } else {
                                            $scope.cardsets[0].errors.push(card.err);
                                        }
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
