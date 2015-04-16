'use strict';

define('entry-directive', ['angular-app', 'jquery'], function(app, $) {
    app.directive('entry', function() {
        return {
            scope: {
                entry: '='
            },
            link: function($scope) {
                chrome.runtime.onMessage.addListener(function(request) {
                    switch(request.msg) {
                        case 'load':
                            $scope.$apply(function() {
                                $scope.entry = null;
                            });
                            $.get('https://hovercards.herokuapp.com/v1/identify', { url: request.url })
                                .done(function(data) {
                                    $scope.$apply(function() {
                                        $scope.entry = data;
                                    });
                                })
                                .fail(function(jqXHR) {
                                    $scope.$apply(function() {
                                        $scope.entry = { err: { code: jqXHR.status, message: jqXHR.responseText } };
                                    });
                                })
                                ;
                            break;
                        case 'hide':
                            $scope.$apply(function() {
                                $scope.entry = null;
                            });
                            break;
                    }
                });
            }
        };
    });
});
