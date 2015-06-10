var _       = require('underscore');
var angular = require('angular');

module.exports = angular.module(chrome.i18n.getMessage('app_short_name') + 'DiscussionComponents', [require('./service-components')])
    .controller('DiscussionController', ['$scope', 'apiService', function($scope, apiService) {
        $scope.$watch('entry.discussions', function(requests) {
            if (!requests) {
                return;
            }
            $scope.entry.discussion_apis = _.keys(requests);
            if ($scope.order && $scope.order.length) {
                $scope.entry.discussion_apis = _.sortBy($scope.entry.discussion_apis, function(api) {
                    return $scope.order.indexOf(api);
                });
            }
        }, true);

        $scope.$watch('order', function(order) {
            if (!order || !order.length) {
                return;
            }
            if ($scope.entry.discussion_apis && $scope.entry.discussion_apis.length) {
                $scope.entry.discussion_apis = _.sortBy($scope.entry.discussion_apis, function(api) {
                    return order.indexOf(api);
                });
            }
        }, true);

        $scope.$watch('entry.desired_discussion_api || entry.discussion_apis[0]', function(api) {
            if (!api || !$scope.entry.discussions || !$scope.entry.discussions[api]) {
                return;
            }
            if (!$scope.data.discussions || !$scope.data.discussions[api]) {
                $scope.data.discussions = $scope.data.discussions || {};
                $scope.data.discussions[api] = apiService.get($scope.entry.discussions[api]);
            }
            $scope.entry.discussion_api = api;
        });

        $scope.$watch('(data.discussions[entry.discussion_api].$resolved || data.discussions[entry.discussion_api].$err) && data.discussions[entry.discussion_api]', function(discussion) {
            if (!discussion) {
                return;
            }
            $scope.data.discussion = discussion;
        });

        $scope.$watch('data.discussion.$resolved && !data.discussion.$err && entry && entry.type !== "url" && data.discussion', function(discussion) {
            if (!discussion) {
                return;
            }

            $scope.entry.content = $scope.entry.content || discussion.content;

            if (discussion.accounts && discussion.accounts.length && ($scope.entry.type === 'discussion' || $scope.entry.type === 'url')) {
                $scope.entry.accounts = _.chain($scope.entry.accounts)
                                         .union(discussion.accounts)
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
    .directive('sortable', function() {
        require('jquery-ui/sortable');
        require('jquery-ui/droppable');

        return {
            restrict: 'A',
            scope: {
                items: '=sortable'
            },
            link: function($scope, $element) {
                $element.sortable({ axis:        'y',
                                    handle:      'b',
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
    })
    .name;
