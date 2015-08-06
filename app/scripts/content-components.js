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
                    })
                    .finally(function() {
                        entry.discussions = entry.discussions || {};
                        var for_request = content.$err ? entry.content : content;
                        if (content.api === 'reddit' || !for_request.api || !for_request.id) {
                            return;
                        }
                        entry.discussions[for_request.api] = entry.discussions[for_request.api] || _.defaults({ type: 'discussion' }, for_request);
                        entry.discussions.reddit  = entry.discussions.reddit  || { api: 'reddit',  type: 'discussion', for: for_request };
                        entry.discussions.twitter = entry.discussions.twitter || { api: 'twitter', type: 'discussion', for: for_request };
                    });
            }());
        });
    }])
    .name;
