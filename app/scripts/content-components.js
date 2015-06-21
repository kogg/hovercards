var _       = require('underscore');
var angular = require('angular');

module.exports = angular.module(chrome.i18n.getMessage('app_short_name') + 'ContentComponents', [require('./service-components')])
    .controller('ContentController', ['$scope', 'apiService', function($scope, apiService) {
        var analytics_once = false;
        $scope.$watch('entry.content', function(request) {
            if (!request) {
                $scope.data.content = null;
                return;
            }
            var entry = $scope.entry;
            $scope.data.content = apiService.get(request);
            $scope.data.content.$promise
                .then(function(content) {
                    if (analytics_once) {
                        return content;
                    }
                    if (entry.times) {
                        analytics_once = true;
                        var now = _.now();
                        chrome.runtime.sendMessage({ type: 'analytics', request: ['send', 'timing', 'cards', 'Time until First Content Card', now - entry.times.start, content.api + '/content'] });
                        if (!entry.times.first_card) {
                            entry.times.first_card = now;
                            chrome.runtime.sendMessage({ type: 'analytics', request: ['send', 'timing', 'cards', 'Time until First Card', entry.times.first_card - entry.times.start, content.api + '/content'] });
                        }
                    }
                    return content;
                })
                .then(function(content) {
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
                    return content;
                });
        });
    }])
    .name;
