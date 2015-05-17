var angular = require('angular');

module.exports = angular.module(chrome.i18n.getMessage('app_short_name') + 'CommonComponents', [require('angular-sanitize'), require('./service-components')])
    .directive('authorize', ['apiService', function(apiService) {
        return {
            restrict: 'A',
            scope: {
                api: '=authorize',
                onAuthorized: '&'
            },
            link: function($scope, $element) {
                var handler = angular.noop;
                $scope.$watch('api', function(api) {
                    $element.unbind('click', handler);
                    if (!api) {
                        return;
                    }
                    $element.click(handler = function() {
                        apiService.get({ api: api, type: 'auth' })
                            .$promise
                            .then(function() {
                                $scope.onAuthorized();
                            });
                    });
                });
            }
        };
    }])
    .directive('loading', ['apiService', function(apiService) {
        return {
            restrict: 'A',
            scope: {
                loading: '='
            },
            link: function($scope) {
                $scope.promises = apiService.loading;
                $scope.$watch('!!promises.length', function(loading) {
                    $scope.loading = loading;
                });
            }
        };
    }])
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
                    $scope.apply(function() {
                        $scope.stored = ($scope.name in obj) ? obj[$scope.name] : $scope.default;
                    });
                    $scope.$watch('stored', function(val, oldVal) {
                        if (val === oldVal) {
                            return;
                        }
                        var obj = {};
                        obj[$scope.name] = val;
                        chrome.storage.sync.set(obj);
                    }, true);
                });
            }
        };
    })
    .filter('copy', function() {
        return function(messagename) {
            return chrome.i18n.getMessage((messagename || '').replace(/\-/g, '_')) || null;
        };
    })
    .filter('generateUrl', function() {
        return require('YoCardsApiCalls/network-urls').generate;
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
                return number;
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

        return function(time, abbrev) {
            if (!time) {
                return;
            }
            moment.locale(abbrev ? 'en-since-abbrev' : 'en-since');
            return moment(time).fromNow();
        };
    })
    .name;
