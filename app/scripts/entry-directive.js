'use strict';

define('entry-directive', ['angular-app', 'URIjs/URI'], function(app, URI) {
    app.directive('entry', function() {
        return {
            scope: {
                entry: '='
            },
            link: function($scope) {
                chrome.runtime.onMessage.addListener(function(request) {
                    switch(request.msg) {
                        case 'load':
                            $scope.$apply(function() {
                                $scope.entry = null;
                            });
                            setTimeout(function() {
                                var uri = URI(request.url);
                                if (uri.domain() === 'youtube.com') {
                                    if (uri.pathname() === '/watch') {
                                        var query = uri.search(true);
                                        if (query.v) {
                                            $scope.$apply(function() {
                                                $scope.entry = { content: { type: 'youtube-video', id: query.v } };
                                            });
                                        }
                                    }
                                }
                            }, 100);
                            break;
                        case 'hide':
                            $scope.$apply(function() {
                                $scope.entry = null;
                            });
                            break;
                    }
                });
            }
        };
    });
});
