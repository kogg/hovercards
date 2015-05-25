var angular = require('angular');

module.exports = angular.module(chrome.i18n.getMessage('app_short_name') + 'DiscussionComponents', [require('./service-components')])
    .controller('DiscussionController', ['$scope', 'apiService', function($scope, apiService) {
        $scope.$watch('entry.discussions', function(requests) {
            if (!requests) {
                return;
            }
            $scope.entry.discussion_apis = Object.keys(requests);
            if ($scope.order && $scope.order.length) {
                $scope.entry.discussion_apis.sort(function(a, b) {
                    return $scope.order.indexOf(a) - $scope.order.indexOf(b);
                });
            }
        }, true);

        $scope.$watch('order', function(order) {
            if (!order || !order.length) {
                return;
            }
            if ($scope.entry.discussion_apis && $scope.entry.discussion_apis.length) {
                $scope.entry.discussion_apis.sort(function(a, b) {
                    return order.indexOf(a) - order.indexOf(b);
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
                $scope.data.discussions[api]
                    .$promise
                    .then(function(discussion) {
                        if (!discussion.comments || !discussion.comments.length) {
                            discussion.$err = { 'empty-content': true };
                        }
                    });
            }
            $scope.entry.discussion_api = api;
        });

        $scope.$watch('(data.discussions[entry.discussion_api].$resolved || data.discussions[entry.discussion_api].$err) && data.discussions[entry.discussion_api]', function(discussion) {
            if (!discussion) {
                return;
            }
            $scope.data.discussion = discussion;
        });

        $scope.$watch('data.discussion.$resolved && entry && data.discussion', function(discussion) {
            if (!discussion) {
                return;
            }

            $scope.entry.content = $scope.entry.content || discussion.content;

            if (discussion.accounts && discussion.accounts.length && ($scope.entry.type === 'discussion' || $scope.entry.type === 'url')) {
                $scope.entry.accounts = ($scope.entry.accounts || []);
                (discussion.accounts || []).forEach(function(account) {
                    if (!$scope.entry.accounts.some(function(entry_account) { return account.api  === entry_account.api &&
                                                                                     account.id   === entry_account.id; })) {
                        $scope.entry.accounts.push(account);
                    }
                });
            }
        });
    }])
    .directive('sortable', function() {
        require('jquery-ui/sortable');
        require('jquery-ui/droppable');

        return {
            restrict: 'A',
            scope: {
                items: '=sortable',
                order: '=?'
            },
            link: function($scope, $element) {
                $element.sortable({ axis:        'y',
                                    handle:      'b',
                                    placeholder: 'ui-state-highlight',
                                    update:      function(event, ui) {
                                        $scope.$apply(function() {
                                            // FIXME Stop directly using discussion_api in here. There has to be a better way
                                            var before = ui.item.prevAll('li').map(function() {
                                                var api = angular.element(this).scope().discussion_api;
                                                if ($scope.order.indexOf(api) === -1) {
                                                    $scope.order.push(api);
                                                }
                                                return api;
                                            }).toArray();
                                            var after = ui.item.nextAll('li').map(function() {
                                                var api = angular.element(this).scope().discussion_api;
                                                if ($scope.order.indexOf(api) === -1) {
                                                    $scope.order.push(api);
                                                }
                                                return api;
                                            }).toArray();
                                            var current = angular.element(ui.item).scope().discussion_api;
                                            if ($scope.order.indexOf(current) === -1) {
                                                $scope.order.push(current);
                                            }

                                            $scope.order.sort(function(a, b) {
                                                var a_val = (a === current) ? 0 : ((before.indexOf(a) !== -1) ? -1 : ((after.indexOf(a) !== -1) ? 1 : 'idk'));
                                                var b_val = (b === current) ? 0 : ((before.indexOf(b) !== -1) ? -1 : ((after.indexOf(b) !== -1) ? 1 : 'idk'));
                                                if (a_val === 'idk' || b_val === 'idk') {
                                                    return 0;
                                                }
                                                return a_val - b_val;
                                            });
                                        });
                                    } });
                $element.disableSelection();
            }
        };
    })
    .name;
