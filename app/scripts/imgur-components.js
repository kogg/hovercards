var _       = require('underscore');
var angular = require('angular');

module.exports = angular.module(chrome.i18n.getMessage('app_short_name') + 'ImgurComponents', [])
    .directive('imgurAlbumCarousel', [function() {
        require('slick-carousel');

        return {
            scope: {
                items: '=imgurAlbumCarousel',
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
    .filter('filesize', [function() {
        var suffixes = ['', 'k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];

        return function(size) {
            if (isNaN(size)) {
                return 'N/A';
            }
            var i = 0;
            while (size >= 1000) {
                size /= 1000;
                i++;
            }
            return Math.floor(size) + suffixes[i] + 'B';
        };
    }])
    .name;
