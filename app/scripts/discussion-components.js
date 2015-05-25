var angular = require('angular');

module.exports = angular.module(chrome.i18n.getMessage('app_short_name') + 'DiscussionComponents', [require('./service-components')])
    .controller('DiscussionController', ['$scope', 'apiService', function($scope, apiService) {
        $scope.$watch('entry.discussion || entry.discussions[0]', function(request) {
            if (!request) {
                return;
            }
            $scope.loading_discussion = apiService.get(request);
            $scope.loading_discussion
                .$promise
                .then(function(discussion) {
                    if (!discussion.comments || !discussion.comments.length) {
                        discussion.$err = { 'empty-content': true };
                    }
                });
        });

        $scope.$watch('loading_discussion.$resolved || loading_discussion.$err', function(show_loading_discussion) {
            if (!show_loading_discussion) {
                return;
            }
            $scope.data.discussion = $scope.loading_discussion;
            $scope.loading_discussion = null;
        });

        $scope.$watch('data && data.discussion.$resolved && entry && data.discussion', function(discussion) {
            if (!discussion) {
                return;
            }

            $scope.entry.content = $scope.entry.content || discussion.content;

            if (discussion.accounts && discussion.accounts.length && $scope.entry.type === 'discussion') {
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
                unsorted: '=sortable',
                sorted:   '=',
                order:    '=?'
            },
            link: function($scope, $element) {
                $scope.order = $scope.order || [];
                function sort_by_order() {
                    console.log('resort with order', $scope.order);
                    $scope.sorted.sort(function(a, b) {
                        return $scope.order.indexOf(a.api) - $scope.order.indexOf(b.api);
                    });
                }
                $scope.$watch('unsorted', function() {
                    $scope.sorted = [];
                    ($scope.unsorted || []).forEach(function(item, i) {
                        $scope.sorted[i] = item;
                    });
                    sort_by_order();
                }, true);
                $scope.$watch('order', function() {
                    sort_by_order();
                }, true);
                $element.sortable({ axis:        'y',
                                    handle:      'b',
                                    placeholder: 'ui-state-highlight',
                                    update:      function(event, ui) {
                                        $scope.$apply(function() {
                                            // FIXME Stop directly using discussion_choice in here. There has to be a better way
                                            var before = ui.item.prevAll('li').map(function() {
                                                var api = angular.element(this).scope().discussion_choice.api;
                                                if ($scope.order.indexOf(api) === -1) {
                                                    $scope.order.push(api);
                                                }
                                                return api;
                                            }).toArray();
                                            var after = ui.item.nextAll('li').map(function() {
                                                var api = angular.element(this).scope().discussion_choice.api;
                                                if ($scope.order.indexOf(api) === -1) {
                                                    $scope.order.push(api);
                                                }
                                                return api;
                                            }).toArray();
                                            var current = angular.element(ui.item).scope().discussion_choice.api;
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
