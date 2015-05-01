var angular = require('angular');

module.exports = angular.module(chrome.i18n.getMessage('app_short_name') + 'ContentComponents', [require('angular-resource')])
    .controller('ContentController', ['$scope', 'contentService', function($scope, contentService) {
        $scope.$watch('entry.content', function(request) {
            if (!request) {
                $scope.data.content = null;
                return null;
            }
            $scope.data.content = (function() {
                $scope.data.loading = ($scope.data.loading || 0) + 1;

                var content = contentService.get(request);
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
    .factory('contentService', ['$resource', function($resource) {
        return $resource('https://' + chrome.i18n.getMessage('app_short_name') + '.herokuapp.com/v1/:api/:type');
    }])
    .name;
