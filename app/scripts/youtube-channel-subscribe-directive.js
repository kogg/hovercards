'use strict';

define(['angular-app'], function(app) {
    app.directive('youtubeChannelSubscribeId', function() {
        return {
            restrict: 'A',
            scope: {
                id: '=youtubeChannelSubscribeId'
            },
            link: function($scope, $element) {
                require(['asyncload!https://apis.google.com/js/platform.js!onload'], function() {
                    /* global gapi */
                    gapi.ytsubscribe.render($element[0], {'channelid': $scope.id, layout: 'default', count: 'hidden' });
                });
            }
        };
    });
});
