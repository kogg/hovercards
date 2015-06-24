var _       = require('underscore');
var angular = require('angular');

module.exports = angular.module(chrome.i18n.getMessage('app_short_name') + 'DiscussionComponents', [require('./service-components')])
    .controller('DiscussionController', ['$scope', '$timeout', 'apiService', function($scope, $timeout, apiService) {
        $scope.$watch('[entry.discussions, order]', function(parts) {
            var requests = parts[0];
            var order    = parts[1];
            if (!requests) {
                return;
            }
            var entry = $scope.entry;
            entry.discussion_apis = _.chain(requests)
                                     .keys(requests)
                                     .sortBy(function(api) {
                                         return _.indexOf(order, api);
                                     })
                                     .value();
            var data = $scope.data;
            data.discussions = data.discussions || {};
            (function check_api(n) {
                $timeout(function() {
                    if (entry.discussion_api) {
                        return;
                    }
                    var api = entry.discussion_apis[n];
                    if (!api) {
                        entry.discussion_api = entry.discussion_apis[0];
                        if (entry.type === 'url') {
                            entry.$err = { 'no-content': true };
                        }
                        return;
                    }
                    data.discussions[api] = data.discussions[api] || apiService.get(entry.discussions[api]);
                    data.discussions[api].$promise.then(function() {
                        entry.discussion_api = entry.discussion_api || api;
                    }, function() {
                        check_api(n+1);
                    });
                });
            }(0));
        }, true);

        var done_once = false;
        var analytics_once = false;
        $scope.$watch('entry.discussion_api', function(api) {
            if (!api) {
                return;
            }
            var entry = $scope.entry;
            if (!(api in entry.discussions)) {
                return;
            }
            var data  = $scope.data;
            data.discussions[api] = data.discussions[api] || apiService.get(entry.discussions[api]);
            data.discussions[api].$promise
                .then(function(discussion) {
                    if (analytics_once) {
                        return discussion;
                    }
                    if (entry.times) {
                        analytics_once = true;
                        var now = _.now();
                        chrome.runtime.sendMessage({ type: 'analytics', request: ['send', 'timing', 'cards', 'Time until First Discussion Card', now - entry.times.start, discussion.api + ' discussion'] });
                        if (!entry.times.first_card) {
                            entry.times.first_card = now;
                            chrome.runtime.sendMessage({ type: 'analytics', request: ['send', 'timing', 'cards', 'Time until First Card', entry.times.first_card - entry.times.start, discussion.api + ' discussion'] });
                        }
                    }
                    return discussion;
                })
                .finally(function() {
                    if (entry.discussion_api !== api) {
                        return;
                    }
                    data.discussion = data.discussions[api];
                })
                .finally(function() {
                    if (done_once) {
                        return;
                    }
                    done_once = true;
                    if (entry.type === 'url') {
                        return;
                    }
                    entry.content = entry.content || data.discussion.content;
                    entry.accounts = _.chain(entry.accounts)
                                      .union(data.discussion.accounts)
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
    .directive('sortable', [function() {
        require('jquery-ui/sortable');
        require('jquery-ui/droppable');

        return {
            restrict: 'A',
            scope: {
                items: '=sortable'
            },
            link: function($scope, $element) {
                $element.sortable({ axis:        'y',
                                    placeholder: 'ui-state-highlight',
                                    update:      function() {
                                        $scope.$apply(function() {
                                            var item_pos = {};
                                            $element.find('li').each(function(i) {
                                                item_pos[$scope.items[angular.element(this).scope().$index]] = i;
                                            });
                                            $scope.items.sort(function(a, b) {
                                                return item_pos[a] - item_pos[b];
                                            });
                                        });
                                    } });
                $element.disableSelection();
            }
        };
    }])
    .name;
