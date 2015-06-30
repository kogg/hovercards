var _       = require('underscore');
var angular = require('angular');

module.exports = angular.module(chrome.i18n.getMessage('app_short_name') + 'CommonComponents', [require('angular-sanitize'), require('angular-messages')])
    .directive('analyticsClick', [function() {
        return {
            scope: {
                category: '@analyticsClick',
                action: '@?analyticsAction',
                label: '@?analyticsLabel'
            },
            link: function($scope, $element) {
                $element.one('click', function() {
                    var request = ['send', 'event', $scope.category, $scope.action || 'clicked'];
                    request.push($scope.label);
                    chrome.runtime.sendMessage({ type: 'analytics', request: request });
                });
            }
        };
    }])
    .directive('popup', ['$window', function($window) {
        return {
            restrict: 'A',
            scope: {
                url:  '@popup',
                size: '=?popupSize'
            },
            link: function($scope, $element) {
                $element.css('cursor', 'pointer');
                $element.click(function() {
                    $window.open($scope.url, 'popup', 'height=' + (($scope.size && $scope.size.height) || 300 ) +
                                                      ',width=' + (($scope.size && $scope.size.width) || 640 ) +
                                                      ',left=' + ($window.screen.width - 990) +
                                                      ',top=70');
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
                cutoffHeight: '@?',
                readless: '=?',
                onReadmore: '&?'
            },
            link: function($scope, $element) {
                $scope.$watch('text', function(text) {
                    $element.html($sanitize(text || ''));
                    if (!text) {
                        return;
                    }
                    (function readmore(event) {
                        if (event) {
                            event.stopPropagation();
                            $scope.onReadmore();
                        }
                        angular.element('<span class="read-more">More</span>').appendTo($element);
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
                                        .click(function(event) {
                                            event.stopPropagation();
                                            $element
                                                .trigger('destroy')
                                                .html($scope.text);
                                            if ($scope.readless) {
                                                angular.element('<span class="read-less">Less</span>')
                                                    .appendTo($element)
                                                    .before(' ')
                                                    .click(readmore);
                                            }
                                            if ($scope.onReadmore) {
                                                $scope.onReadmore();
                                            }
                                        });
                                }
                            });
                        });
                    }());
                });
            }
        };
    }])
    .directive('sharePage', [function() {
        return {
            restrict: 'A',
            scope: {
                content: '=sharePage'
            },
            templateUrl: 'templates/sharepage.html'
        };
    }])
    .directive('stored', [function() {
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
    }])
    .directive('video', [function() {
        return {
            restrict: 'E',
            scope: {
                clickControls: '=?',
                fullscreen: '=?',
                onVideoLoad: '&?',
                src: '@videoSrc',
                view: '=?'
            },
            link: function($scope, $element) {
                $scope.is_playing = false;
                $scope.$watch('src', function(src) {
                    $element.attr('src', src);
                });
                if ($scope.clickControls) {
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
                            $scope.$apply(function() {
                                if ($scope.view.fullscreen === $scope.fullscreen) {
                                    $scope.view.fullscreen = null;
                                } else {
                                    $scope.view.fullscreen = $scope.fullscreen;
                                }
                            });
                        });
                    }
                    $element.on('play', function() {
                        console.log('play');
                        $scope.$apply(function() {
                            $scope.is_playing = true;
                        });
                    });
                    $element.on('pause', function() {
                        console.log('pause');
                        $scope.$apply(function() {
                            $scope.is_playing = false;
                        });
                    });
                }
                if ($scope.onVideoLoad) {
                    $element.on('loadedmetadata', function() {
                        $scope.onVideoLoad();
                    });
                }
            }
        };
    }])
    .filter('copy', [function() {
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
    }])
    .filter('encode', [function() {
        return function(content) {
            var output = encodeURIComponent(content);
            if (output === 'undefined') {
                return '';
            }
            return output;
        };
    }])
    .filter('generateUrl', [function() {
        return require('YoCardsApiCalls/network-urls').generate;
    }])
    .filter('shareUrl', [function() {
        return require('YoCardsApiCalls/network-urls').share;
    }])
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
    .filter('timeSince', [function() {
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
    }])
    .name;
