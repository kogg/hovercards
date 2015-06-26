var angular = require('angular');

module.exports = angular.module(chrome.i18n.getMessage('app_short_name') + 'ImgurComponents', [])
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
