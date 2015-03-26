'use strict';

define(['angular-app', 'youtube-channel-subscribe-directive', 'description-filter', 'numsmall-filter', 'slide-animation'], function(app) {
    app.directive('youtubeChannel', function() {
        return {
            scope: {
                id: '=youtubeChannelId'
            },
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
                            $scope.loaded = true;
                        });
                    });
                    removeWatch();
                });
            }
        };
    });
});
