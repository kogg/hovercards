var _       = require('underscore');
var angular = require('angular');

module.exports = angular.module(chrome.i18n.getMessage('app_short_name') + 'ContentComponents', [require('./service-components')])
    .controller('ContentController', ['$scope', '$timeout', 'apiService', function($scope, $timeout, apiService) {
        $scope.$watch('entry.content', function(request) {
            if (!request) {
                $scope.data.content = null;
                return;
            }
            var entry = $scope.entry;
            (function reload() {
                var content = apiService.get(request);
                $scope.data.content = content;
                var timeout = $timeout(function() {
                    content.$err = { 'still-waiting': true, api: request.api };
                }, 5000);
                content.$promise
                    .finally(function() {
                        $timeout.cancel(timeout);
                    })
                    .then(function(content) {
                        delete content.$err;
                        entry.timing.content(_.now(), content.api);
                    })
                    .catch(function(err) {
                        err.reload = reload;
                    });
            }());
        });
    }])
    .name;
