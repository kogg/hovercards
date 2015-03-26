'use strict';

define(['angular-app'], function(app) {
    app.directive('youtubeVideo', function() {
        return {
            scope: {
                channelId: '=youtubeChannelId',
                id: '=youtubeVideoId'
            },
            templateUrl: 'templates/youtube-video-card.html',
            link: function($scope) {
                var removeWatch = $scope.$watch('id', function(id) {
                    if (!id) {
                        return;
                    }
                    chrome.runtime.sendMessage({ msg: 'youtube', content: 'youtube-video', id: id }, function(youtubeVideo) {
                        $scope.$apply(function() {
                            $scope.image       = youtubeVideo.image;
                            $scope.title       = youtubeVideo.title;
                            $scope.description = youtubeVideo.description;
                            $scope.date        = youtubeVideo.date;
                            $scope.views       = youtubeVideo.views;
                            $scope.likes       = youtubeVideo.likes;
                            $scope.dislikes    = youtubeVideo.dislikes;
                            $scope.channelId   = youtubeVideo.channelId;
                            $scope.loaded = true;
                        });
                    });
                    removeWatch();
                });
            }
        };
    });
});
