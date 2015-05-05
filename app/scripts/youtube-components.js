var angular = require('angular');

module.exports = angular.module(chrome.i18n.getMessage('app_short_name') + 'YoutubeComponents', [])
    .directive('youtubeChannelSubscribe', function() {
        return {
            restrict: 'A',
            scope: {
                id:     '=youtubeChannelId',
                offset: '=subscribedOffset'
            },
            link: function($scope, $element) {
                $scope.offset = 0;
                /* global gapi */
                gapi.ytsubscribe.render($element[0], { channelid: $scope.id,
                                                       layout:    'default',
                                                       count:     'hidden',
                                                       onytevent: function(payload) {
                                                           switch (payload.eventType) {
                                                               case 'subscribe':
                                                                   $scope.$apply(function() {
                                                                       $scope.offset++;
                                                                   });
                                                                   break;
                                                               case 'unsubscribe':
                                                                   $scope.$apply(function() {
                                                                       $scope.offset--;
                                                                   });
                                                                   break;
                                                           }
                                                       } });
            }
        };
    })
    .name;
