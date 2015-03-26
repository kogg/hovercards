'use strict';

define(['angular-app'], function(app) {
    app.directive('youtubeChannel', function() {
        return {
            scope: {
                id: '=youtubeChannelId'
            },
            replace: true,
            templateUrl: 'templates/youtube-channel-card.html',
            link: function($scope) {
                var removeWatch = $scope.$watch('id', function(id) {
                    if (!id) {
                        return;
                    }
                    chrome.runtime.sendMessage({ msg: 'youtube', content: 'youtube-channel', id: id }, function(youtubeVideo) {
                        $scope.$apply(function() {
                            $scope.image       = youtubeVideo.image;
                            $scope.title       = youtubeVideo.title;
                            $scope.description = youtubeVideo.description;
                            $scope.videos      = youtubeVideo.videos;
                            $scope.views       = youtubeVideo.views;
                            $scope.subscribers = youtubeVideo.subscribers;
                        });
                    });
                    removeWatch();
                });
            }
        };
    });
});
