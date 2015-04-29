var angular = require('angular');

module.exports = angular.module('hovercardsMoreContentComponents', [require('angular-resource')])
    .controller('MoreContentController', ['$scope', 'moreContentService', function($scope, moreContentService) {
        $scope.$watch('entry.selectedPerson.selectedAccount', function(request) {
            if (!request) {
                $scope.data.moreContent = null;
                return null;
            }
            $scope.data.moreContent = (function() {
                $scope.data.loading = ($scope.data.loading || 0) + 1;

                var moreContent = moreContentService.get({ type: request.type, id: request.id });
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
    .factory('moreContentService', ['$resource', function($resource) {
        return $resource('https://hovercards.herokuapp.com/v1/:type/:id/content');
    }])
    .name;

