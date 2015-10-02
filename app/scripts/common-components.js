var _       = require('underscore');
var angular = require('angular');

module.exports = angular.module(chrome.i18n.getMessage('app_short_name') + 'CommonComponents', ['ngAnimate', require('angular-sanitize'), require('angular-messages')])
    .config(function($animateProvider) {
        $animateProvider.classNameFilter(/^(?:(?!ng-animate-disabled).)*$/);
    })
    .directive('analyticsClick', [function() {
        return {
            link: function($scope, $element, $attrs) {
                $element.one('click', function() {
                    angular.element.analytics('send', 'event', $attrs.analyticsClick,
                                                               $attrs.analyticsAction || 'click',
                                                               $attrs.analyticsLabel);
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
                onHeightChange: '&?',
                noMore: '=?'
            },
            link: function($scope, $element) {
                $element.html('');
                /*
                angular.element('<div style="height: ' + ($scope.recollapseAt || 0) + 'px; border: 1px green solid; pointer-events: none; position: absolute; width: 100%;"></div>').appendTo($element);
                angular.element('<div style="height: ' + ($scope.collapseAt + ($scope.tolerance || 0)) + 'px; border: 1px blue solid; pointer-events: none; position: absolute; width: 100%;"></div>').appendTo($element);
                angular.element('<div style="height: ' + ($scope.collapseAt || 0) + 'px; border: 1px red solid; pointer-events: none; position: absolute; width: 100%;"></div>').appendTo($element);
                */
                var collapsed = angular.element('<div class="collapsed ng-hide"></div>').appendTo($element);
                var expanded = angular.element('<div class="expanded ng-hide"></div>').appendTo($element);
                // TODO Watch all scope changes
                $scope.$watchGroup(['content', 'collapseAt', 'tolerance', 'recollapseAt', 'noMore'], function(args) {
                    var content      = args[0];
                    var collapseAt   = args[1];
                    var tolerance    = args[2] || 0;
                    var recollapseAt = args[3];
                    var noMore       = args[4];
                    content = $sanitize(content || '');
                    expanded.addClass('ng-hide').html(content);
                    collapsed.addClass('ng-hide').html('');
                    if (!content) {
                        return;
                    }

                    expanded.removeClass('ng-hide');
                    if (expanded.height() <= collapseAt + tolerance) {
                        return;
                    }
                    if (recollapseAt && expanded.height() >= recollapseAt) {
                        angular.element('<span class="read-less">Less</span>')
                            .appendTo(expanded)
                            .before(' ')
                            .click(function(event) {
                                event.stopPropagation();
                                expanded.addClass('ng-hide');
                                collapsed.removeClass('ng-hide');
                                ($scope.onHeightChange || angular.noop)();
                            });
                    }
                    expanded.addClass('ng-hide');
                    collapsed.removeClass('ng-hide');

                    var more = !noMore && angular.element('<span class="read-more">More</span>')
                        .click(function(event) {
                            event.stopPropagation();
                            expanded.removeClass('ng-hide');
                            collapsed.addClass('ng-hide');
                            ($scope.onHeightChange || angular.noop)();
                        });
                    (function binary_collapse(insert_into, contents, read_more) {
                        var front, middle, back;
                        if (insert_into.get(0).nodeType === 3) {
                            if (read_more) {
                                insert_into.after(read_more);
                            }
                            var string = insert_into.get(0).nodeValue;
                            front = 0;
                            back = string.length;
                            while (front + 1 < back) {
                                middle = Math.ceil((front + back) / 2);
                                insert_into.get(0).nodeValue = string.slice(0, middle) + '... ';
                                if (collapsed.height() <= collapseAt) {
                                    front = middle;
                                } else {
                                    back = middle;
                                }
                            }
                            insert_into.get(0).nodeValue = string.slice(0, front) + '... ';
                            if (collapsed.height() <= collapseAt) {
                                return true;
                            }
                            if (read_more) {
                                read_more.detach();
                            }
                            return false;
                        }
                        if (!contents.length) {
                            return false;
                        }
                        front = 0;
                        back = contents.length;
                        while (front + 1 < back) {
                            middle = Math.ceil((front + back) / 2);
                            var testing = contents.slice(0, middle).add(read_more);
                            testing.appendTo(insert_into);
                            if (collapsed.height() <= collapseAt) {
                                front = middle;
                            } else {
                                back = middle;
                            }
                            testing.detach();
                        }
                        var elements = contents.slice(0, back);
                        elements.appendTo(insert_into);
                        for (var i = back - 1; i >= 0; i--) {
                            var element = angular.element(elements[i]);
                            var new_contents = element.contents().clone();
                            element.empty();
                            var worked = false;
                            if (!element.is('a,table,pre,code')) {
                                worked = binary_collapse(element, new_contents, read_more);
                            } else {
                                insert_into.append(read_more);
                                worked = binary_collapse(element, new_contents);
                            }
                            if (worked) {
                                return true;
                            }
                            element.detach();
                            if (element.is('a,table,pre,code') && read_more) {
                                read_more.detach();
                            }
                        }
                        return false;
                    }(collapsed, expanded.contents().clone(), more));
                });
            }
        };
    }])
    .directive('ngCarousel', [function() {
        require('slick-carousel');

        return {
            scope: {
                items:     '=ngCarousel',
                slide:     '=?',
                selected:  '=?',
                weirdDots: '=?'
            },
            transclude: true,
            link: function($scope, $element, attr, ctrl, $transclude) {
                var slick_dots    = $scope.weirdDots && angular.element('<div></div>').appendTo($element);
                var slick_element = angular.element('<div></div>').appendTo($element);
                var scopes = [];

                if ($scope.weirdDots) {
                    slick_element.on('beforeChange', function(e, slider, last_slide, slide) {
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
                }

                slick_element.on('afterChange', function(e, slider, slide) {
                    $scope.$apply(function() {
                        scopes[$scope.slide].$selected = false;
                        $scope.slide = slide;
                        scopes[$scope.slide].$selected = true;
                        $scope.selected = $scope.items[$scope.slide];
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
                    if (!scopes[$scope.slide]) {
                        return;
                    }
                    scopes[$scope.slide].$selected = true;
                    $scope.selected = $scope.items[$scope.slide];
                });

                slick_element.slick(_.extend({ arrows:        false,
                                               centerMode:    true,
                                               centerPadding: 0,
                                               focusOnSelect: true,
                                               infinite:      false,
                                               slidesToShow:  1 },
                                             $scope.weirdDots && { appendDots: slick_dots, dots: true }));

                $scope.$watchCollection('items', function(items) {
                    _.invoke(scopes, '$destroy');
                    _.times(scopes.length, function() {
                        slick_element.slick('slickRemove', 0);
                    });
                    scopes = [];
                    _.each(items, function(item, i) {
                        $transclude(function(elem, scope) {
                            var element = angular.element('<div style="height: auto !important;"></div>');
                            elem.appendTo(element);
                            slick_element.slick('slickAdd', element);
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
                });

                $scope.$watch('slide', function(slide) {
                    slick_element.slick('slickGoTo', slide);
                });

                $scope.$on('$destroy', function() {
                    _.invoke(scopes, '$destroy');
                });
            }
        };
    }])
    .directive('onImageLoad', [function() {
        return {
            scope: {
                'onImageLoad': '&'
            },
            link: function($scope, $element) {
                $element.bind('load', function() {
                    $scope.onImageLoad();
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
            if (!_.isString(arguments[0]) || !arguments[0].length) {
                return arguments[0];
            }
            return chrome.i18n.getMessage(arguments[0].replace(/\-/g, '_'), _.rest(arguments));
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
        return require('hovercardsshared/apis/network-urls').generate;
    }])
    .filter('shareUrl', [function() {
        return require('hovercardsshared/apis/network-urls').share;
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
