var angular = require('angular');

module.exports = angular.module('hovercardsCommonComponents', [require('angular-sanitize')])
    .filter('copy', function() {
        return function(messagename) {
            if (!messagename) {
                return messagename;
            }
            return chrome.i18n.getMessage(messagename.replace(/\-/g, '_')) || messagename;
        };
    })
    .filter('htmlify', ['$filter', function($filter) {
        return function(content) {
            return $filter('linky')(content, '_blank').replace(/(&#10;|\n)/g, '<br>');
        };
    }])
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
            }
        };
    })
    .filter('trustresourceurl', ['$sce', function($sce) {
        return function(url) {
            return $sce.trustAsResourceUrl(url);
        };
    }])
    .name;
