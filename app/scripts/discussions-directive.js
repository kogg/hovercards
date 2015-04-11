'use strict';

define('discussions-directive', ['angular-app'], function(app) {
    app.directive('discussions', function() {
        return {
            scope: {
                request: '=',
                discussions: '='
            },
            link: function($scope) {
                var timeout;
                $scope.$watch('request', function(request) {
                    if (!request) {
                        $scope.discussions = null;
                        clearTimeout(timeout);
                        return;
                    }
                    timeout = setTimeout(function() {
                        $scope.$apply(function() {
                            $scope.discussions = [{ type: 'youtube-comments', id: 'm3lF2qEA2cw' },
                                                  { type: 'reddit-comments', id: 'SOME_ID' }];
                        });
                    }, 333);
                });
            }
        };
    });
});
