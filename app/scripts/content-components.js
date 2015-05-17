var angular = require('angular');

module.exports = angular.module(chrome.i18n.getMessage('app_short_name') + 'ContentComponents', [require('./service-components')])
    .controller('ContentController', ['$scope', 'apiService', function($scope, apiService) {
        $scope.$watch('entry.content', function(request) {
            if (!request) {
                $scope.data.content = null;
                return;
            }
            $scope.reload = function() {
                $scope.data.content = apiService.get(request);
            };
            $scope.reload();
        });
    }])
    .name;
