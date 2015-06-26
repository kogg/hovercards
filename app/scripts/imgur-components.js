var _       = require('underscore');
var angular = require('angular');

module.exports = angular.module(chrome.i18n.getMessage('app_short_name') + 'ImgurComponents', [])
    .directive('imgurAlbumCarousel', ['$compile', function($compile) {
        require('slick-carousel');

        return {
            link: function($scope, $element) {
                var been_slicked = false;

                // $element.on('afterChange', function(e, slider, slide) {
                $element.on('beforeChange', function(e, slider, lastSlide, slide) {
                    $scope.$apply(function() {
                        $scope.data.content.current_slide = slide;
                    });
                });

                $element.on('beforeChange', function(e, slider, lastSlide, slide) {
                    angular.element(slider.$slider).height(angular.element(slider.$slides[slide]).height());
                });

                $scope.$watchCollection('data.content.images', function(images) {
                    if (been_slicked) {
                        $element.slick('unslick');
                    }
                    _.each(images, function(image) {
                        var element = '<div style="height: auto !important;"><div ng-include="\'templates/imgur_content_album_image.html\'"></div></div>';
                        $element.append($compile(element)(_.extend($scope.$new(), { image: image })));
                    });
                    $element.slick({ appendDots: '.imgur-dots', arrows: false, centerMode: true, centerPadding: 0, dots: true, focusOnSelect: true, infinite: false, slidesToShow: 1 });
                    been_slicked = true;

                    $element.one('init', function(e, slider) {
                        angular.element(slider.$slider).height(angular.element(slider.$slides[0]).height());
                        $scope.$apply(function() {
                            $scope.data.content.current_slide = 0;
                        });
                    });
                });
            }
        };
    }])
    .filter('filesize', [function() {
        var suffixes = ['', 'k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];

        return function(size) {
            if (isNaN(size)) {
                return 'N/A';
            } else {
                var i = 0;
                while (size >= 1000) {
                    size /= 1000;
                    i++;
                }
                return Math.floor(size) + suffixes[i] + 'B';
            }
        };
    }])
    .name;
