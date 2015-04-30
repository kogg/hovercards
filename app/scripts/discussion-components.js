var angular = require('angular');

module.exports = angular.module(chrome.i18n.getMessage('app_short_name') + 'DiscussionComponents', [require('angular-resource')])
    .controller('DiscussionController', ['$scope', 'discussionService', function($scope, discussionService) {
        $scope.$watch('entry.discussion', function(request) {
            if (!request) {
                return null;
            }
            $scope.loading_discussion = (function() {
                $scope.data.loading = ($scope.data.loading || 0) + 1;

                var discussion = discussionService.get({ type: request.type, id: request.id });
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

        $scope.$watch('entry.discussions', function(requests) {
            if (!requests) {
                return;
            }
            $scope.entry.discussion = $scope.entry.discussion || $scope.entry.discussions[0];
        });
    }])
    .factory('discussionService', ['$resource', function($resource) {
        return $resource('https://' + chrome.i18n.getMessage('app_short_name') + '.herokuapp.com/v1/:type/:id');
    }])
    .name;
