'use strict';

define('content-directive', ['angular-app'], function(app) {
    app.directive('content', function() {
        return {
            scope: {
                request: '=',
                content: '='
            },
            link: function($scope) {
                var timeout;
                $scope.$watch('request', function(request) {
                    if (!request) {
                        $scope.content = null;
                        clearTimeout(timeout);
                        return;
                    }
                    timeout = setTimeout(function() {
                        $scope.$apply(function() {
                            $scope.content = { type: 'youtube-video', id: 'm3lF2qEA2cw' };
                        });
                    }, 333);
                });
            }
        };
    });
});
