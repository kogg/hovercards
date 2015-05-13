var angular = require('angular');

module.exports = angular.module(chrome.i18n.getMessage('app_short_name') + 'DiscussionComponents', [require('./service-components')])
    .controller('DiscussionController', ['$scope', 'apiService', function($scope, apiService) {
        $scope.$watch('entry.discussion || entry.discussions[0]', function(request) {
            if (!request) {
                return;
            }
            $scope.loading_discussion = (function() {
                $scope.data.loading = ($scope.data.loading || 0) + 1;

                var discussion = apiService.get(request);
                discussion.$promise
                    .then(function() {
                        if (!discussion.comments || !discussion.comments.length) {
                            discussion.$err = { 'empty-content': true };
                        }
                    })
                    .catch(function(err) {
                        discussion.$err = err;
                    })
                    .finally(function() {
                        $scope.data.loading--;
                        if ($scope.loading_discussion !== discussion) {
                            return;
                        }
                        $scope.data.discussion = $scope.loading_discussion;
                        $scope.loading_discussion = null;
                    });

                return discussion;
            }());
        });
    }])
    .directive('sortable', function() {
        require('jquery-ui/sortable');
        require('jquery-ui/droppable');

        return {
            restrict: 'A',
            link: function($scope, $element) {
                $element.sortable({ axis:        'y',
                                    handle:      'b',
                                    placeholder: 'ui-state-highlight',
                                    update:      function(event, ui) {
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

                                        $scope.$apply(function() {
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
