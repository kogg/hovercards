var _       = require('underscore');
var angular = require('angular');

module.exports = angular.module(chrome.i18n.getMessage('app_short_name') + 'ContentComponents', [require('./service-components')])
    .controller('ContentController', ['$scope', 'apiService', function($scope, apiService) {
        $scope.$watch('entry.content', function(request) {
            if (!request) {
                $scope.data.content = null;
                return;
            }
            var entry = $scope.entry;
            $scope.data.content = apiService.get(request);
            $scope.data.content.$promise.then(function(content) {
                if (!content) {
                    return;
                }
                entry.discussions = _.chain(content.discussions)
                                     .indexBy('api')
                                     .extend(entry.discussions)
                                     .value();
                entry.accounts = _.chain(entry.accounts)
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
            });
        });
    }])
    .name;
