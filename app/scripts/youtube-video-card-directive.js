'use strict';

define(['angular-app'], function(app) {
    app.directive('youtubeVideo', function() {
        return {
            scope: {
                channelId: '=youtubeChannelId',
                id: '=youtubeVideoId'
            },
            replace: true,
            templateUrl: 'templates/youtube-video-card.html',
            link: function($scope) {
                chrome.runtime.sendMessage({ msg: 'youtube', content: 'youtube-video', id: $scope.id }, function(err, youtubeVideo) {
                    $scope.$apply(function() {
                        $scope.image       = youtubeVideo.image;
                        $scope.title       = youtubeVideo.title;
                        $scope.description = youtubeVideo.description;
                        $scope.date        = youtubeVideo.date;
                        $scope.views       = youtubeVideo.views;
                        $scope.likes       = youtubeVideo.likes;
                        $scope.dislikes    = youtubeVideo.dislikes;
                        $scope.channelId   = youtubeVideo.channelId;
                    });
                });
            }
        };
    });
});
