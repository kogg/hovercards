'use strict';

define(['angular-app'], function(app) {
    app.directive('youtubeVideo', function() {
        return {
            scope: {
                channelID: '=youtubeChannelId',
                videoID: '=youtubeVideoId'
            },
            replace: true,
            templateUrl: 'templates/youtube-video-card.html',
            link: function($scope) {
                chrome.runtime.sendMessage({ msg: 'api', content: 'youtube-video', id: $scope.videoID }, function() {
                });
            }
        };
    });
});
