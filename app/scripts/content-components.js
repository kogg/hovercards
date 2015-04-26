var angular = require('angular');

module.exports = angular.module('hovercardsContentComponents', [require('angular-resource')])
    .controller('ContentController', ['$scope', 'contentService', function($scope, contentService) {
        $scope.$watch('entry.content', function(request) {
            if (!request) {
                $scope.content = null;
                return null;
            }
            $scope.content = (function() {
                $scope.entry.loading = ($scope.entry.loading || 0) + 1;

                var content = contentService.get({ type: request.type, id: request.id });
                content.$promise
                    .catch(function(err) {
                        content.$err = err;
                    })
                    .finally(function() {
                        $scope.entry.loading--;
                    });

                return content;
            }());
        });
    }])
    .factory('contentService', ['$resource', function($resource) {
        return $resource('https://hovercards.herokuapp.com/v1/:type/:id');
    }])
    .name;
