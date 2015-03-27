'use strict';

define(['angular-app', 'content-directive', 'readmore-directive', 'htmlify-filter', 'numsmall-filter'], function(app) {
    app.directive('youtubeComments', function() {
        return {
            scope: {
                id: '=youtubeVideoId'
            },
            templateUrl: 'templates/youtube-comments-card.html',
            link: function($scope) {
                var removeWatch = $scope.$watch('id', function(id) {
                    if (!id) {
                        return;
                    }
                    chrome.runtime.sendMessage({ msg: 'youtube', content: 'youtube-comments-v2', id: id }, function(youtubeComments) {
                        $scope.$apply(function() {
                            $scope.comments = youtubeComments.comments;
                            $scope.loaded = true;
                        });
                    });
                    removeWatch();
                });
            }
        };
    });
});
