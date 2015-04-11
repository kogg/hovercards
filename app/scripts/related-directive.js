'use strict';

define('related-directive', ['angular-app'], function(app) {
    app.directive('related', function() {
        return {
            scope: {
                request: '=',
                related: '='
            },
            link: function($scope) {
                var timeout;
                $scope.$watch('request', function(request) {
                    if (!request) {
                        $scope.related = null;
                        clearTimeout(timeout);
                        return;
                    }
                    timeout = setTimeout(function() {
                        $scope.$apply(function() {
                            $scope.related = { contents: [{}, {}] };
                        });
                    }, 333);
                });
            }
        };
    });
});
