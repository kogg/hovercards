var angular = require('angular');

module.exports = angular.module(chrome.i18n.getMessage('app_short_name') + 'MoreContentComponents', [require('./service-components')])
    .controller('MoreContentController', ['$scope', 'serverService', function($scope, serverService) {
        $scope.$watch('entry.selectedPerson.selectedAccount', function(request) {
            if (!request) {
                $scope.data.moreContent = null;
                return null;
            }
            $scope.data.moreContent = (function() {
                $scope.data.loading = ($scope.data.loading || 0) + 1;

                var moreContent = serverService.get({ api: request.api, type: 'more_content', id: request.id });
                moreContent.$promise
                    .catch(function(err) {
                        moreContent.$err = err;
                    })
                    .finally(function() {
                        $scope.data.loading--;
                    });

                return moreContent;
            }());
        });
    }])
    .name;

