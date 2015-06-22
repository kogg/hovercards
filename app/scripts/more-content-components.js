var angular = require('angular');

module.exports = angular.module(chrome.i18n.getMessage('app_short_name') + 'MoreContentComponents', [require('./service-components')])
    .controller('MoreContentController', ['$scope', '$timeout', 'apiService', function($scope, $timeout, apiService) {
        $scope.$watch('entry.selectedPerson.selectedAccount', function(account) {
            $scope.data.moreContent = null;
            if (!account) {
                return;
            }
            account.moreContent = account.moreContent || apiService.get({ api: account.api, type: 'more_content', id: account.id });
            var timeout = $timeout(function() {
                account.moreContent.$err = { 'still-waiting': true, api: account.api };
            }, 5000);
            account.moreContent.$promise
                .finally(function() {
                    $timeout.cancel(timeout);
                })
                .then(function(more_content) {
                    delete more_content.$err;
                });
            $timeout(function() {
                $scope.data.moreContent = account.moreContent;
            });
        });
    }])
    .name;
