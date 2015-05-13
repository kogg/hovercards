var angular = require('angular');

module.exports = angular.module(chrome.i18n.getMessage('app_short_name') + 'MoreContentComponents', [require('./service-components')])
    .controller('MoreContentController', ['$scope', 'apiService', function($scope, apiService) {
        $scope.$watch('entry.selectedPerson.selectedAccount', function(request) {
            if (!request) {
                $scope.data.moreContent = null;
                return;
            }
            $scope.data.moreContent = (function() {
                $scope.data.loading = ($scope.data.loading || 0) + 1;

                var moreContent = apiService.get({ api: request.api, type: 'more_content', id: request.id });
                moreContent.$promise
                    .then(function() {
                        if (!moreContent.content || !moreContent.content.length) {
                            moreContent.$err = { 'empty-content': true };
                        }
                    })
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

