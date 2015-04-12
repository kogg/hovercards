'use strict';

define('people-directive', ['angular-app'], function(app) {
    app.directive('people', function() {
        return {
            scope: {
                request: '=',
                people: '='
            },
            link: function($scope) {
                var timeout;
                $scope.$watch('request', function(request) {
                    $scope.people = null;
                    clearTimeout(timeout);
                    if (!request) {
                        return;
                    }
                    timeout = setTimeout(function() {
                        $scope.$apply(function() {
                            $scope.people = [{ accounts: [{ type: 'youtube-channel', id: 'UCORIeT1hk6tYBuntEXsguLg' }, { type: 'twitter-account', id: 'SOME_ID' }] },
                                             {}];
                        });
                    }, 333);
                });
            }
        };
    });
});
