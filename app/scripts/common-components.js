var angular = require('angular');

module.exports = angular.module(chrome.i18n.getMessage('app_short_name') + 'CommonComponents', [require('angular-sanitize')])
    .directive('readmore', ['$sanitize', function($sanitize) {
        require('dotdotdot');

        return {
            restrict: 'A',
            scope: {
                text: '=readmore',
                cutoffHeight: '@?'
            },
            link: function($scope, $element) {
                $scope.$watch('text', function(text) {
                    $element.html($sanitize(text || ''));
                    if (!text) {
                        return;
                    }
                    $element.append('<span class="read-more">Read More</span>');
                    $element.dotdotdot({
                        after: 'span.read-more',
                        height: Number($scope.cutoffHeight),
                        callback: function(isTruncated) {
                            var read_more = $element.find('.read-more');
                            if (!isTruncated) {
                                read_more.remove();
                                return;
                            }
                            read_more
                                .appendTo($element) // FIXME Hack AF https://github.com/BeSite/jQuery.dotdotdot/issues/67
                                .click(function() {
                                    $element
                                        .trigger('destroy')
                                        .html($scope.text);
                                });
                        }
                    });
                });
            }
        };
    }])
    .directive('scrollPeriodically', ['$interval', function($interval) {
        return {
            scope: {
                doWhile: '=scrollPeriodically'
            },
            link: function($scope) {
                var interval;
                $scope.$watch('!!doWhile', function(doIt) {
                    if (doIt) {
                        interval = $interval(function() {
                            angular.element(window).scroll();
                        }, 1000);
                    } else if (interval) {
                        $interval.cancel(interval);
                        interval = null;
                    }
                });
            }
        };
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
    .directive('stored', function() {
        return {
            retrict: 'A',
            scope: {
                stored: '=',
                name: '@',
                default: '=?'
            },
            link: function($scope) {
                $scope.stored = $scope.default;
                chrome.storage.sync.get($scope.name, function(obj) {
                    $scope.$watch('stored', function(val, oldVal) {
                        if (val === oldVal) {
                            return;
                        }
                        var obj = {};
                        obj[$scope.name] = val;
                        chrome.storage.sync.set(obj);
                    }, true);
                    if ($scope.name in obj) {
                        $scope.stored = obj[$scope.name];
                    } else {
                        $scope.stored = $scope.default;
                    }
                });
            }
        };
    })
    .filter('copy', function() {
        return function(messagename) {
            if (!messagename) {
                return '';
            }
            return chrome.i18n.getMessage(messagename.replace(/\-/g, '_')) || messagename;
        };
    })
    .filter('generateUrl', function() {
        var network_urls = require('YoCardsApiCalls/network-urls');

        return network_urls.generate;
    })
    .filter('numsmall', function() {
        return function(number) {
            if (number < 10000) {
                return number + '';
            } else if (number < 1000000) {
                return Math.floor(number / 1000) + 'k';
            } else if (number < 1000000000) {
                return parseFloat(Math.floor(number / 10000) / 100).toFixed(2) + 'm';
            } else if (number < 1000000000000) {
                return parseFloat(Math.floor(number / 10000000) / 100).toFixed(2) + 'b';
            } else {
                return 0;
            }
        };
    })
    .filter('percent', ['$filter', function($filter) {
        return function(ratio) {
            return $filter('number')(100 * ratio) + '%';
        };
    }])
    .filter('timeSince', function() {
        var moment  = require('moment');
        moment.locale('en-since', {
            relativeTime: {
                future: 'in %s',
                past:   '%s ago',
                s:  'seconds',
                m:  '1 minute',
                mm: '%d minutes',
                h:  '1 hour',
                hh: '%d hours',
                d:  '1 day',
                dd: '%d days',
                M:  '1 month',
                MM: '%d months',
                y:  '1 year',
                yy: '%d years'
            }
        });

        return function(time) {
            if (!time) {
                return '';
            }
            moment.locale('en-since');
            return moment(time).fromNow();
        };
    })
    .filter('timeSinceAbbr', function() {
        var moment  = require('moment');
        moment.locale('en-since-abbrev', {
            relativeTime: {
                future: '%s',
                past:   '%s',
                s:      's',
                m:      '%dm',
                mm:     '%dm',
                h:      '%dh',
                hh:     '%dh',
                d:      '%dd',
                dd:     '%dd',
                M:      '%dM',
                MM:     '%dM',
                y:      '%dy',
                yy:     '%dy'
            }
        });

        return function(time) {
            if (!time) {
                return '';
            }
            moment.locale('en-since-abbrev');
            return moment(time).fromNow();
        };
    })
    .filter('trustresourceurl', ['$sce', function($sce) {
        return function(url) {
            if (!url) {
                return '';
            }
            return $sce.trustAsResourceUrl(url);
        };
    }])
    .name;
