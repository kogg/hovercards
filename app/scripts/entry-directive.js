'use strict';

define('entry-directive', ['angular-app'], function(app) {
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
                            setTimeout(function() {
                                $scope.$apply(function() {
                                    $scope.entry = { content: { type: 'youtube-video', id: 'm3lF2qEA2cw' } };
                                });
                            }, 333);
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
