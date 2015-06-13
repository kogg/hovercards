var _       = require('underscore');
var angular = require('angular');

module.exports = angular.module(chrome.i18n.getMessage('app_short_name') + 'CommonComponents', [require('angular-sanitize'), require('angular-messages')])
    .directive('err', [function() {
        return {
            restrict: 'A',
            scope: {
                err: '=',
                api: '@?',
                entry: '=?'
            },
            transclude: true,
            templateUrl: function(element, attr) {
                return 'templates/' + attr.type + '_exceptions.html';
            }
        };
    }])
    .directive('popup', ['$window', function($window) {
        return {
            restrict: 'A',
            scope: {
                url:  '@popup',
                size: '=popupSize'
            },
            link: function($scope, $element) {
                $element.click(function() {
                    $window.open($scope.url, 'popup', 'height=' + $scope.size.height + ',width=' + $scope.size.width + ',left=' + ($window.screen.width - 990) + ',top=70');
                });
            }
        };
    }])
    .directive('readmore', ['$sanitize', '$timeout', function($sanitize, $timeout) {
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
                    $timeout(function() {
                        $element.dotdotdot({
                            after: 'span.read-more',
                            height: Number($scope.cutoffHeight),
                            callback: function(isTruncated) {
                                var read_more = $element.find('.read-more');
                                if (!isTruncated) {
                                    read_more.remove();
                                    return;
                                }
                                if (!read_more.length) {
                                    read_more = angular.element('<span class="read-more">Read More</span>');
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
                    $scope.$apply(function() {
                        $scope.stored = ($scope.name in obj) ? obj[$scope.name] : $scope.default;
                    });
                    $scope.$watch('stored', function(val, oldVal) {
                        if (val === oldVal) {
                            return;
                        }
                        var obj = {};
                        obj[$scope.name] = val;
                        console.log('set storage', $scope.name, 'to', val);
                        chrome.storage.sync.set(obj);
                    }, true);
                });
                function onStorageChanged(changes, area_name) {
                    if (area_name !== 'sync' || !($scope.name in changes)) {
                        return;
                    }
                    $scope.$apply(function() {
                        if (!_.isEqual($scope.stored, changes[$scope.name].newValue)) {
                            console.log('set scope', $scope.name, 'to', changes[$scope.name].newValue);
                            $scope.stored = changes[$scope.name].newValue;
                        }
                    });
                }
                chrome.storage.onChanged.addListener(onStorageChanged);
                $scope.$on('$destroy', function() {
                    chrome.storage.onChanged.removeListener(onStorageChanged);
                });
            }
        };
    })
    .directive('video', function() {
        return {
            restrict: 'E',
            scope: {
                src: '@videoSrc',
                fullscreen: '=?',
                view: '=?'
            },
            link: function($scope, $element) {
                $scope.is_playing = false;
                $scope.$watch('src', function(src) {
                    $element.attr('src', src);
                });
                $element.click(function() {
                    $scope.$apply(function() {
                        if ($scope.is_playing) {
                            $element.get(0).pause();
                        } else {
                            $element.get(0).play();
                        }
                    });
                });
                if ($scope.fullscreen && $scope.view) {
                    $element.dblclick(function() {
                        if ($scope.view.fullscreen === $scope.fullscreen) {
                            $scope.view.fullscreen = null;
                        } else {
                            $scope.view.fullscreen = $scope.fullscreen;
                        }
                    });
                }
                $element.get(0).onplay = function() {
                    $scope.$apply(function() {
                        $scope.is_playing = true;
                    });
                };
                $element.get(0).onpause = function() {
                    $scope.$apply(function() {
                        $scope.is_playing = false;
                    });
                };
            }
        };
    })
    .filter('copy', function() {
        return function() {
            if (!arguments[0] || arguments[0] === '') {
                return arguments[0];
            }
            var string = chrome.i18n.getMessage(arguments[0].replace(/\-/g, '_'), _.rest(arguments));
            if (!string) {
                console.warn(JSON.stringify(arguments[0]) + ' does not have copy');
            }
            return string;
        };
    })
    .filter('generateUrl', function() {
        return require('YoCardsApiCalls/network-urls').generate;
    })
    .filter('numsmall', ['$filter', function($filter) {
        var suffixes = { 1000: 'k', 1000000: 'm', 1000000000: 'b', 1000000000000: 't' };
        return function(number) {
            if (isNaN(number)) {
                return 'N/A';
            } else {
                var prefix = '';
                if (number < 0) {
                    number = -number;
                    prefix = '-';
                }
                var digits = Math.ceil(Math.log10(number + 0.5));
                if (digits < 5) {
                    return prefix + $filter('number')(number);
                } else {
                    var three_digits_less = Math.pow(10, Math.floor(digits - 3));
                    var nearest_three_digit = Math.pow(10, 3 * Math.floor((digits - 1) / 3));
                    number = three_digits_less * Math.round(number / three_digits_less) / nearest_three_digit;
                    return prefix + number + suffixes[nearest_three_digit];
                }
            }
        };
    }])
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
                s:  '%d seconds',
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
                s:      '%ds',
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
