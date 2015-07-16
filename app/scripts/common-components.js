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
    .directive('collapse', ['$sanitize', function($sanitize) {
        /*
         * Usual Settings:
         *    # of Lines for | Collapse At | Tolerance | Recollapse At |
         * ------------------+-------------+-----------+---------------+
         *     Small Comment |           2 |         3 |            10 |
         * Media Description |           4 |         2 |            10 |
         *        Small Blob |           7 |         3 |            15 |
         *        Large Blob |          15 |         4 |            25 |
         */
        return {
            restrict: 'A',
            scope: {
                content: '=collapse',
                collapseAt: '=',
                tolerance: '=?',
                recollapseAt: '=?',
                onHeightChange: '&?'
            },
            link: function($scope, $element) {
                $element.html('');
                var collapsed = angular.element('<div class="collapsed ng-hide"></div>').appendTo($element);
                var expanded = angular.element('<div class="expanded ng-hide"></div>').appendTo($element);
                // TODO Watch all scope changes
                $scope.$watch('content', function(content) {
                    content = $sanitize(content || '');
                    expanded.addClass('ng-hide').html(content);
                    collapsed.addClass('ng-hide').html('');
                    if (!content) {
                        return;
                    }

                    expanded.removeClass('ng-hide');
                    if (expanded.height() <= $scope.collapseAt + ($scope.tolerance || 0)) {
                        return;
                    }
                    if ($scope.recollapseAt && expanded.height() >= $scope.recollapseAt) {
                        angular.element('<span class="read-less">Less</span>')
                            .appendTo(expanded)
                            .before(' ')
                            .click(function(event) {
                                event.stopPropagation();
                                expanded.addClass('ng-hide');
                                collapsed.removeClass('ng-hide');
                                ($scope.onHeightChange || angular.noop)('expanded');
                            });
                    }
                    expanded.addClass('ng-hide');
                    collapsed.removeClass('ng-hide');

                    var more = angular.element('<span class="read-more">More</span>')
                        .click(function(event) {
                            event.stopPropagation();
                            expanded.removeClass('ng-hide');
                            collapsed.addClass('ng-hide');
                            ($scope.onHeightChange || angular.noop)('collapsed');
                        });
                    (function binary_add_element(element, contents) {
                        var loop = 0;
                        var good = 0;
                        var bad = contents.length;
                        while (good + 1 < bad && loop < 100) {
                            var trying = Math.ceil((good + bad) / 2);
                            var testing = contents.slice(good, trying);
                            testing.appendTo(element);
                            more.appendTo(collapsed).before(' ');
                            if (collapsed.height() <= $scope.collapseAt) {
                                good = trying;
                            } else {
                                bad = trying;
                                testing.detach();
                            }
                            more.detach();
                            loop++;
                        }
                        if (loop === 100) {
                            return;
                        }
                        var bad_element = contents[good];
                        if (!bad_element) {
                            return;
                        }
                        if (bad_element.nodeType !== 3) {
                            bad_element = angular.element(bad_element);
                            var new_contents = bad_element.contents().clone();
                            bad_element
                                .appendTo(element)
                                .empty();
                            return binary_add_element(bad_element, new_contents);
                        }
                        element.append(bad_element);
                        var string = bad_element.nodeValue;
                        bad_element.nodeValue = string + '...';
                        loop = 0;
                        var front = 0;
                        var back = string.length;
                        more.appendTo(collapsed).before(' ');
                        while (front + 1 < back && loop < 100) {
                            var attempting = Math.ceil((front + back) / 2);
                            bad_element.nodeValue = string.slice(0, attempting) + '...';
                            if (collapsed.height() <= $scope.collapseAt) {
                                front = attempting;
                            } else {
                                back = attempting;
                            }
                            loop++;
                        }
                        bad_element.nodeValue = string.slice(0, front) + '...';
                        more.detach();
                    }(collapsed, expanded.contents().clone()));
                    more.appendTo(collapsed).before(' ');
                });
            }
        };
    }])
    .directive('ngCarousel', [function() {
        require('slick-carousel');

        return {
            scope: {
                items: '=ngCarousel',
                slide: '=?'
            },
            transclude: true,
            link: function($scope, $element, attr, ctrl, $transclude) {
                var slick_dots    = angular.element('<div></div>').appendTo($element);
                var slick_element = angular.element('<div></div>').appendTo($element);

                slick_element.on('beforeChange', function(e, slider, last_slide, slide) {
                    $scope.$apply(function() {
                        var dot = angular.element(slick_dots.find('li')[slide]);
                        var dots = slick_dots.find('ul');
                        if (!dot) {
                            return;
                        }
                        var dot_position = dot.position();
                        if (!dot_position) {
                            return;
                        }
                        dots.animate({ scrollLeft: dot_position.left + dots.scrollLeft() - (dot.width() + $element.width()) / 2 - 8 }, 200);
                    });
                });

                slick_element.on('afterChange', function(e, slider, slide) {
                    $scope.$apply(function() {
                        scopes[$scope.slide].$selected = false;
                        $scope.slide = slide;
                        scopes[$scope.slide].$selected = true;
                    });
                });

                slick_element.on('beforeChange', function(e, slider, last_slide, slide) {
                    var last_slide_height = angular.element(slider.$slides[last_slide]).height();
                    var slide_height = angular.element(slider.$slides[slide]).height();
                    if (last_slide_height >= slide_height) {
                        return;
                    }
                    slick_element.height(angular.element(slider.$slides[slide]).height());
                });
                slick_element.on('afterChange', function(e, slider, slide) {
                    var slide_height = angular.element(slider.$slides[slide]).height();
                    if (slick_element.height() === slide_height) {
                        return;
                    }
                    slick_element.height(slide_height);
                });

                slick_element.on('init', function() {
                    $scope.slide = 0;
                    scopes[0].$selected = true;
                });

                var scopes;
                var been_slicked = false;
                $scope.$watchCollection('items', function(items) {
                    if (been_slicked) {
                        slick_element.slick('unslick');
                    }
                    _.invoke(scopes, '$destroy');
                    scopes = [];
                    _.each(items, function(item, i) {
                        var element = angular.element('<div style="height: auto !important;"></div>').appendTo(slick_element);

                        $transclude(function(elem, scope) {
                            elem.appendTo(element);
                            scopes[i] = scope;
                            scope.$item   = item;
                            scope.$index  = i;
                            scope.$first  = i === 0;
                            scope.$second = i === 1;
                            scope.$last   = i === items.length - 1;
                            scope.$middle = !(scope.$first || scope.$last);
                            scope.$even   = i % 2 === 0;
                            scope.$odd    = !$scope.odd;
                            scope.redoHeight = function() {
                                if (!scope.$selected) {
                                    return;
                                }
                                slick_element.height(angular.element(element).height());
                            };
                        });
                    });
                    slick_element.slick({ appendDots: slick_dots, arrows: false, centerMode: true, centerPadding: 0, dots: true, focusOnSelect: true, infinite: false, slidesToShow: 1 });
                    been_slicked = true;
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
    .directive('scrollToHorizontal', [function() {
        require('jquery-ui/core');

        return {
            scope: {
                on: '=scrollToHorizontal',
            },
            link: function($scope, $element) {
                $scope.$watch('on', function(on, onBefore) {
                    if (on === onBefore || !on) {
                        return;
                    }
                    var scrollParent = $element.scrollParent();
                    scrollParent.animate({ scrollLeft: $element.position().left + scrollParent.scrollLeft() + $element.width() - scrollParent.width() / 2 }, 200);
                });
            }
        };
    }])
    .directive('shaker', [function() {
        return {
            link: function($scope, $element) {
                $scope.$watch('entry.shake', function(shake, oldShake) {
                    if (!shake || shake === oldShake) {
                        return;
                    }
                    $element.addClass('shakeit');
                });

                $element.on('animationend MSAnimationEnd webkitAnimationEnd oAnimationEnd', function(e) {
                    if (e.originalEvent.animationName !== 'shake-base') {
                        return;
                    }
                    $element.removeClass('shakeit');
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
            }
            var prefix = '';
            if (number < 0) {
                number = -number;
                prefix = '-';
            }
            var digits = Math.ceil(Math.log10(number + 0.5));
            if (digits < 5) {
                return prefix + $filter('number')(number);
            }
            var three_digits_less = Math.pow(10, Math.floor(digits - 3));
            var nearest_three_digit = Math.pow(10, 3 * Math.floor((digits - 1) / 3));
            number = three_digits_less * Math.round(number / three_digits_less) / nearest_three_digit;
            return prefix + number + suffixes[nearest_three_digit];
        };
    }])
    .filter('percent', ['$filter', function($filter) {
        return function(ratio) {
            return $filter('number')(100 * ratio) + '%';
        };
    }])
    .filter('timestamp', [function() {
        return function(time) {
            if (isNaN(time)) {
                return 'N/A';
            }
            var output = '';
            time = Math.floor(time / 1000);
            output = (time % 60);
            time = Math.floor(time / 60);
            for (var i = 0; time > 0 || i === 0; i++) {
                output = ('00000' + output).substr(-2 + -3 * i);
                output = (time % 60) + ':' + output;
                time = Math.floor(time / 60);
            }
            return output;
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
    .filter('trustedHtml', ['$sce', function($sce) {
        return $sce.trustAsHtml;
    }])
    .filter('trustedUrl', ['$sce', function($sce) {
        return $sce.trustAsResourceUrl;
    }])
    .name;
