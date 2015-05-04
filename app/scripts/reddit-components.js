var angular = require('angular');

module.exports = angular.module(chrome.i18n.getMessage('app_short_name') + 'RedditComponents', [])
    .filter('score', function() {
        return function(score) {
            if (score > 0) {
                return '+' + score;
            }
            return '' + score;
        };
    })
    .name;

