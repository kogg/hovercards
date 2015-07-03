var _       = require('underscore');
var angular = require('angular');

module.exports = angular.module(chrome.i18n.getMessage('app_short_name') + 'ContentComponents', [require('./service-components')])
    .controller('ContentController', ['$scope', '$timeout', 'apiService', function($scope, $timeout, apiService) {
        var analytics_once = false;
        $scope.$watch('entry.content', function(request) {
            if (!request) {
                $scope.data.content = null;
                return;
            }
            var entry = $scope.entry;
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
                    if (analytics_once) {
                        return content;
                    }
                    if (entry.times) {
                        analytics_once = true;
                        var now = _.now();
                        chrome.runtime.sendMessage({ type: 'analytics', request: ['send', 'timing', 'cards', 'Time until First Content Card', now - entry.times.start, content.api + ' content'] });
                        if (!entry.times.first_card) {
                            entry.times.first_card = now;
                            chrome.runtime.sendMessage({ type: 'analytics', request: ['send', 'timing', 'cards', 'Time until First Card', entry.times.first_card - entry.times.start, content.api + ' content'] });
                        }
                    }
                    return content;
                })
                .then(function(content) {
                    delete content.$err;

                    entry.accounts = _.chain(entry.accounts)
                                      .union(content.accounts)
                                      .compact()
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
                })
                .finally(function() {
                    entry.discussions = _.extend((function get_discussions() {
                        var for_request = content.$err ? request : content;
                        if (content.api === 'reddit' || !for_request.api || !for_request.id) {
                            return {};
                        }
                        var discussions = {};
                        discussions.reddit  = { api: 'reddit',  type: 'discussion', for: for_request };
                        discussions.twitter = { api: 'twitter', type: 'discussion', for: for_request };
                        discussions[for_request.api] = _.chain(for_request).clone().extend({ type: 'discussion' }).value();
                        return discussions;
                    }()), entry.discussions);
                });
        });
    }])
    .name;
