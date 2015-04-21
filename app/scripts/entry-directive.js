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
                                switch (uri.domain()) {
                                    case 'youtube.com':
                                        switch (uri.directory()) {
                                            case '/':
                                                if (uri.filename() === 'watch') {
                                                    var query = uri.search(true);
                                                    if (query.v) {
                                                        $scope.$apply(function() {
                                                            $scope.entry = { content: { type: 'youtube-video', id: query.v } };
                                                        });
                                                    }
                                                }
                                                break;
                                            case '/v':
                                            case '/embed':
                                                $scope.$apply(function() {
                                                    $scope.entry = { content: { type: 'youtube-video', id: uri.filename() } };
                                                });
                                                break;
                                            case '/channel':
                                                $scope.$apply(function() {
                                                    $scope.entry = { accounts: [{ type: 'youtube-channel', id: uri.filename() }] };
                                                });
                                                break;
                                        }
                                        break;
                                    case 'youtu.be':
                                        $scope.$apply(function() {
                                            $scope.entry = { content: { type: 'youtube-video', id: uri.filename() } };
                                        });
                                        break;
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
