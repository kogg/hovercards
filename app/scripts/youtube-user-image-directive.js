'use strict';

define(['angular-app'], function(app) {
    app.directive('youtubeUserImage', function() {
        return {
            scope: {
                id: '=youtubeUserId'
            },
            link: function($scope, $element) {
                var removeWatch = $scope.$watch('id', function(id) {
                    if (!id) {
                        return;
                    }
                    chrome.runtime.sendMessage({ msg: 'youtube', content: 'youtube-user-v2', id: id }, function(youtubeUser) {
                        $scope.$apply(function() {
                            $scope.image = youtubeUser.image;
                            $element.css('background-image', 'url(' + $scope.image + ')');
                            $scope.loaded = true;
                        });
                    });
                    removeWatch();
                });
            }
        };
    });
});
