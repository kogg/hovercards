var _       = require('underscore');
var angular = require('angular');

var EXTENSION_ID = chrome.i18n.getMessage('@@extension_id');

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
                                     .omit(function(request, api) {
                                         return (api === 'imgur' && request.as !== 'gallery') ||
                                                (api === 'soundcloud' && request.as !== 'track');
                                     })
                                     .keys()
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
                        return;
                    }
                    (function reload(previous_discussion) {
                        data.discussions[api] = previous_discussion || apiService.get(entry.discussions[api]);
                        data.discussions[api].$promise
                            .then(function() {
                                entry.discussion_api = entry.discussion_api || api;
                            })
                            .catch(function(err) {
                                err.reload = reload;
                                check_api(n + 1);
                            });
                    }(data.discussions[api]));
                });
            }(0));
        }, true);

        $scope.$watch('entry.discussion_api', function(api) {
            if (!api) {
                return;
            }
            var entry = $scope.entry;
            entry.show_header = null;
            if (!(api in entry.discussions)) {
                return;
            }
            var data = $scope.data;
            data.discussions[api] = data.discussions[api] || apiService.get(entry.discussions[api]);
            data.discussions[api].$promise
                .then(function(discussion) {
                    entry.timing.discussion(_.now(), api);
                    _.extend(discussion, _.pick(entry.discussions[api], 'author'));
                })
                .finally(function() {
                    if (entry.discussion_api !== api) {
                        return;
                    }
                    data.discussion = data.discussions[api];
                });
        });
    }])
    .controller('UrlDiscussionController', ['$scope', 'apiService', function($scope, apiService) {
        $scope.$watch('entry.discussions', function(requests) {
            if (!requests) {
                return;
            }
            var entry = $scope.entry;
            var data = $scope.data;
            requests = _.omit(requests, function(request, api) {
                switch (api) {
                    case 'imgur':
                        return request.as !== 'gallery';
                    case 'soundcloud':
                        return request.as !== 'track';
                }
                return false;
            });
            var err_count = 0;
            data.discussions = _.chain(requests)
                                .keys()
                                .sortBy(function(api) {
                                    return _.indexOf($scope.order, api);
                                })
                                .map(function(api) {
                                    var discussion = apiService.get(requests[api]);
                                    discussion.$promise
                                        .then(function(discussion) {
                                            entry.timing.discussion(_.now(), api);
                                            _.extend(discussion, _.pick(requests[api], 'author'));
                                            return discussion;
                                        })
                                        .catch(function() {
                                            err_count++;
                                            if (err_count !== data.discussions.length) {
                                                return;
                                            }
                                            entry.$err = { 'no-content': true };
                                        });
                                    return discussion;
                                })
                                .value();
            if (!data.discussions.length) {
                entry.$err = { 'no-content': true };
            }
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
                                            $element.trigger('analytics.' + EXTENSION_ID, ['send', 'event', 'discussions reordered', 'somehow']);
                                        });
                                    } });
                $element.disableSelection();
            }
        };
    }])
    .name;
