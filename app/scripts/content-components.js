var angular = require('angular');

module.exports = angular.module(chrome.i18n.getMessage('app_short_name') + 'ContentComponents', [require('./service-components')])
    .controller('ContentController', ['$scope', 'serverService', function($scope, serverService) {
        $scope.$watch('entry.content', function(request) {
            if (!request) {
                $scope.data.content = null;
                return null;
            }
            $scope.data.content = (function() {
                $scope.data.loading = ($scope.data.loading || 0) + 1;

                var content = serverService.get(request);
                content.$promise
                    .catch(function(err) {
                        content.$err = err;
                    })
                    .finally(function() {
                        $scope.data.loading--;
                    });

                return content;
            }());
        });
    }])
    .name;
