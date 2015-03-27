'use strict';

define(['angular-app', 'htmlify-filter', 'numsmall-filter'], function(app) {
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
                    chrome.runtime.sendMessage({ msg: 'youtube', content: 'youtube-comments', id: id }, function(youtubeComments) {
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
