var angular = require('angular');

module.exports = angular.module('hovercardsDiscussionComponents', [require('angular-resource')])
    .controller('DiscussionController', ['$scope', 'discussionService', function($scope, discussionService) {
        $scope.$watch('entry.discussion', function(request) {
            if (!request) {
                $scope.discussion = null;
                return null;
            }
            $scope.discussion = (function() {
                $scope.entry.loading = ($scope.entry.loading || 0) + 1;

                var discussion = discussionService.get({ type: request.type, id: request.id });
                discussion.$promise
                    .catch(function(err) {
                        discussion.$err = err;
                    })
                    .finally(function() {
                        $scope.entry.loading--;
                    });

                return discussion;
            }());
        });

        $scope.$watch('entry.discussions', function(requests) {
            if (!requests) {
                return;
            }
            $scope.entry.discussion = $scope.entry.discussions[0];
        });
    }])
    .factory('discussionService', ['$resource', function($resource) {
        return $resource('https://hovercards.herokuapp.com/v1/:type/:id');
    }])
    .name;
