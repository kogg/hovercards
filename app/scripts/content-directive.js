'use strict';

define('content-directive', ['angular-app'], function(app) {
    app.directive('content', function() {
        return {
            scope: {
                request: '=',
                content: '='
            },
            link: function($scope) {
                var timeout;
                $scope.$watch('request', function(request) {
                    $scope.content = null;
                    clearTimeout(timeout);
                    if (!request) {
                        return;
                    }
                    timeout = setTimeout(function() {
                        $scope.$apply(function() {
                            $scope.content = { type:        'youtube-video',
                                               id:          'm3lF2qEA2cw',
                                               name:        'Creep - Vintage Postmodern Jukebox Radiohead Cover ft. Haley Reinhart',
                                               description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
                                               image:       'https://i.ytimg.com/vi/m3lF2qEA2cw/mqdefault.jpg',
                                               date:        1428437477000,
                                               views:       1109017,
                                               likes:       28125,
                                               dislikes:    384,
                                               accounts:    [{ type: 'youtube-channel',
                                                               id:   'UCORIeT1hk6tYBuntEXsguLg' }] };
                        });
                    }, 333);
                });
            }
        };
    });
});
