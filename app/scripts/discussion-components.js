var angular = require('angular');

module.exports = angular.module(chrome.i18n.getMessage('app_short_name') + 'DiscussionComponents', [require('./service-components')])
    .controller('DiscussionController', ['$scope', 'serverService', function($scope, serverService) {
        $scope.$watch('entry.discussion || entry.discussions[0]', function(request) {
            if (!request) {
                return null;
            }
            $scope.loading_discussion = (function() {
                $scope.data.loading = ($scope.data.loading || 0) + 1;

                var discussion = serverService.get(request);
                discussion.$promise
                    .catch(function(err) {
                        discussion.$err = err;
                    })
                    .finally(function() {
                        $scope.data.loading--;
                        if ($scope.loading_discussion !== discussion) {
                            return;
                        }
                        $scope.data.discussion = $scope.loading_discussion;
                        $scope.loading_discussion = null;
                    });

                return discussion;
            }());
        });
    }])
    .name;
