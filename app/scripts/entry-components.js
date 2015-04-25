var URI = require('URIjs/src/URI');

function content_entry(type, id) {
    var entry = { content: { type: type, id: id } };

    if (type === 'youtube-video') {
        entry.discussions = [{ type: 'youtube-comments', id: id }, { type: 'reddit-comments', id: 'youtube_' + id }];
    }

    return entry;
}

module.exports = angular.module('hovercardsEntryComponents', [])
    .controller('EntryController', ['$scope', function($scope) {
        window.addEventListener('message', function(event) {
            var request = event.data;
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
                                                    $scope.entry = content_entry('youtube-video', query.v);
                                                });
                                            }
                                        }
                                        break;
                                    case '/v':
                                    case '/embed':
                                        $scope.$apply(function() {
                                            $scope.entry = content_entry('youtube-video', uri.filename());
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
                                    $scope.entry = content_entry('youtube-video', uri.filename());
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
        }, false);
    }])
    .name;
