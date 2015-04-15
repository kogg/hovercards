'use strict';

define('account-directive', ['angular-app'], function(app) {
    app.directive('account', function() {
        return {
            scope: {
                request: '=',
                account: '='
            },
            link: function($scope) {
                $scope.$watch('request', function(request) {
                    $scope.account = null;

                    setTimeout(function() {
                        $scope.$apply(function() {
                            $scope.account = request;
                        });
                    }, 200);
                });
            }
        };
    });
});
