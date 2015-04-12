'use strict';

define('account-directive', ['angular-app'], function(app) {
    app.directive('account', function() {
        return {
            scope: {
                request: '=',
                account: '='
            },
            link: function($scope) {
                var timeout;
                $scope.$watch('request', function(request) {
                    $scope.account = null;
                    clearTimeout(timeout);
                    if (!request) {
                        return;
                    }
                    timeout = setTimeout(function() {
                        $scope.$apply(function() {
                            $scope.account = { type:        'youtube-channel',
                                               id:          'UCORIeT1hk6tYBuntEXsguLg',
                                               image:       'https://yt3.ggpht.com/-Gqi7IQdC_9s/AAAAAAAAAAI/AAAAAAAAAAA/nQZn4aCQ-ZA/s240-c-k-no/photo.jpg',
                                               name:        'ScottBradleeLovesYa',
                                               description: 'An alternate universe of pop music.\nSnapchat: scottbradlee\nTwitter / Insta: scottbradlee\n\niTunes: https://itunes.apple.com/us/artist/scott-bradlee-postmodern-jukebox/id636865970\n\n\n\nPMJ Tour Tix: http://www.PMJLive.com\nThe Great Impression Tour: 2015 North American Dates on sale now\n\n\nWebsite:  http://www.postmodernjukebox.com\nMy Patreon:  http://www.patreon.com/scottbradlee\nTwitter / Instagram / Vine: @scottbradlee\n\n"Like" me!\nhttp://www.facebook.com/scottbradleemusic\n\nand Postmodern Jukebox:\nhttp://www.facebook.com/postmodernjukebox',
                                               subscribers: 1063079,
                                               videos:      138,
                                               views:       199361777 };
                        });
                    }, 333);
                });
            }
        };
    });
});
