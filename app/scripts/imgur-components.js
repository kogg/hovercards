var _       = require('underscore');
var angular = require('angular');

module.exports = angular.module(chrome.i18n.getMessage('app_short_name') + 'ImgurComponents', [])
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
    .filter('imgurImage', [function() {
        return function(item, size) {
            if (!_.isObject(item)) {
                return null;
            }
            return 'http://i.imgur.com/' + item.id + (size || '') + '.jpg';
        };
    }])
    .filter('imgurVideo', [function() {
        return function(item, size) {
            if (!_.isObject(item)) {
                return null;
            }
            return 'http://i.imgur.com/' + item.id + (size || '') + '.mp4';
        };
    }])
    .name;
