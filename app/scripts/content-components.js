var _       = require('underscore');
var angular = require('angular');

module.exports = angular.module(chrome.i18n.getMessage('app_short_name') + 'ContentComponents', [require('./service-components')])
    .controller('ContentController', ['$scope', 'apiService', function($scope, apiService) {
        $scope.$watch('entry.content', function(request) {
            if (!request) {
                $scope.data.content = null;
                return;
            }
            $scope.data.content = apiService.get(request);
        });

        $scope.$watch('data.content.$resolved && !data.content.$err && entry && entry.type !== "url" && data.content', function(content) {
            if (!content) {
                return;
            }

            if (content.discussions && content.discussions.length) {
                $scope.entry.discussions = _.chain(content.discussions)
                                            .indexBy('api')
                                            .extend($scope.entry.discussions)
                                            .value();
            }

            if (content.accounts && content.accounts.length) {
                $scope.entry.accounts = _.chain($scope.entry.accounts)
                                         .union(content.accounts)
                                         .sortBy(function(account) {
                                             var pos = _.indexOf(['author', 'tag', 'mention'], account.reason);
                                             if (pos === -1) {
                                                 pos = Infinity;
                                             }
                                             return pos;
                                         })
                                         .uniq(false, function(account) {
                                             return account.api + '/' + account.id;
                                         })
                                         .value();
            }
        });
    }])
    .name;
