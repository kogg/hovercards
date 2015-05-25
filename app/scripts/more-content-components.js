var angular = require('angular');

module.exports = angular.module(chrome.i18n.getMessage('app_short_name') + 'MoreContentComponents', [require('./service-components')])
    .controller('MoreContentController', ['$scope', 'apiService', function($scope, apiService) {
        $scope.$watch('entry.selectedPerson.selectedAccount', function(request) {
            if (!request) {
                $scope.data.moreContent = null;
                return;
            }
            $scope.data.moreContent = apiService.get({ api: request.api, type: 'more_content', id: request.id });
        });
    }])
    .name;

