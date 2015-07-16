var angular = require('angular');

module.exports = angular.module(chrome.i18n.getMessage('app_short_name') + 'ImgurComponents', [])
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
