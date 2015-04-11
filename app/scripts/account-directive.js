'use strict';

define('account-directive', ['angular-app'], function(app) {
    app.directive('account', function() {
        return {
            scope: {
                request: '=',
                account: '='
            },
            link: function($scope) {
                var timeout;
                $scope.$watch('request', function(request) {
                    if (!request) {
                        $scope.account = null;
                        clearTimeout(timeout);
                        return;
                    }
                    timeout = setTimeout(function() {
                        $scope.$apply(function() {
                            $scope.account = request;
                        });
                    }, 333);
                });
            }
        };
    });
});
