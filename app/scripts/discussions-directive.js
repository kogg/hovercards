'use strict';

define('discussions-directive', ['angular-app'], function(app) {
    app.directive('discussions', function() {
        return {
            scope: {
                request: '=',
                discussions: '='
            },
            link: function($scope) {
                var timeout;
                $scope.$watch('request', function(request) {
                    if (!request) {
                        $scope.discussions = null;
                        clearTimeout(timeout);
                        return;
                    }
                    timeout = setTimeout(function() {
                        $scope.$apply(function() {
                            $scope.discussions = [{ type:     'youtube-comments',
                                                    id:       'm3lF2qEA2cw',
                                                    count:    1650,
                                                    comments: [{ description: 'New Video! Check out Haley Reinhart\'s beautifully haunting rendition of our \nvintage arrangement of Radiohead\'s \"Creep,\" and get ready for some chills. \n\nSee PMJ on tour in North America this Spring: http://www.pmjlive.com',
                                                                 date:        1428438215000,
                                                                 channel:     { id:    'UCORIeT1hk6tYBuntEXsguLg',
                                                                                name:  'ScottBradleeLovesYa',
                                                                                image: 'https://yt3.ggpht.com/-Gqi7IQdC_9s/AAAAAAAAAAI/AAAAAAAAAAA/nQZn4aCQ-ZA/s88-c-k-no/photo.jpg' } },
                                                               { description: 'New Video! Check out Haley Reinhart\'s beautifully haunting rendition of our \nvintage arrangement of Radiohead\'s \"Creep,\" and get ready for some chills. \n\nSee PMJ on tour in North America this Spring: http://www.pmjlive.com',
                                                                 date:        1428438215000,
                                                                 channel:     { id:    'UCORIeT1hk6tYBuntEXsguLg',
                                                                                name:  'ScottBradleeLovesYa',
                                                                                image: 'https://yt3.ggpht.com/-Gqi7IQdC_9s/AAAAAAAAAAI/AAAAAAAAAAA/nQZn4aCQ-ZA/s88-c-k-no/photo.jpg' } },
                                                               { description: 'New Video! Check out Haley Reinhart\'s beautifully haunting rendition of our \nvintage arrangement of Radiohead\'s \"Creep,\" and get ready for some chills. \n\nSee PMJ on tour in North America this Spring: http://www.pmjlive.com',
                                                                 date:        1428438215000,
                                                                 channel:     { id:    'UCORIeT1hk6tYBuntEXsguLg',
                                                                                name:  'ScottBradleeLovesYa',
                                                                                image: 'https://yt3.ggpht.com/-Gqi7IQdC_9s/AAAAAAAAAAI/AAAAAAAAAAA/nQZn4aCQ-ZA/s88-c-k-no/photo.jpg' } },
                                                               { description: 'New Video! Check out Haley Reinhart\'s beautifully haunting rendition of our \nvintage arrangement of Radiohead\'s \"Creep,\" and get ready for some chills. \n\nSee PMJ on tour in North America this Spring: http://www.pmjlive.com',
                                                                 date:        1428438215000,
                                                                 channel:     { id:    'UCORIeT1hk6tYBuntEXsguLg',
                                                                                name:  'ScottBradleeLovesYa',
                                                                                image: 'https://yt3.ggpht.com/-Gqi7IQdC_9s/AAAAAAAAAAI/AAAAAAAAAAA/nQZn4aCQ-ZA/s88-c-k-no/photo.jpg' } },
                                                               { description: 'New Video! Check out Haley Reinhart\'s beautifully haunting rendition of our \nvintage arrangement of Radiohead\'s \"Creep,\" and get ready for some chills. \n\nSee PMJ on tour in North America this Spring: http://www.pmjlive.com',
                                                                 date:        1428438215000,
                                                                 channel:     { id:    'UCORIeT1hk6tYBuntEXsguLg',
                                                                                name:  'ScottBradleeLovesYa',
                                                                                image: 'https://yt3.ggpht.com/-Gqi7IQdC_9s/AAAAAAAAAAI/AAAAAAAAAAA/nQZn4aCQ-ZA/s88-c-k-no/photo.jpg' } }] },
                                                  { type:     'youtube-comments',
                                                    id:       'm3lF2qEA2cw',
                                                    count:    1650,
                                                    comments: [{ description: 'New Video! Check out Haley Reinhart\'s beautifully haunting rendition of our \nvintage arrangement of Radiohead\'s \"Creep,\" and get ready for some chills. \n\nSee PMJ on tour in North America this Spring: http://www.pmjlive.com',
                                                                 date:        1428438215000,
                                                                 channel:     { id:    'UCORIeT1hk6tYBuntEXsguLg',
                                                                                name:  'ScottBradleeLovesYa',
                                                                                image: 'https://yt3.ggpht.com/-Gqi7IQdC_9s/AAAAAAAAAAI/AAAAAAAAAAA/nQZn4aCQ-ZA/s88-c-k-no/photo.jpg' } },
                                                               { description: 'New Video! Check out Haley Reinhart\'s beautifully haunting rendition of our \nvintage arrangement of Radiohead\'s \"Creep,\" and get ready for some chills. \n\nSee PMJ on tour in North America this Spring: http://www.pmjlive.com',
                                                                 date:        1428438215000,
                                                                 channel:     { id:    'UCORIeT1hk6tYBuntEXsguLg',
                                                                                name:  'ScottBradleeLovesYa',
                                                                                image: 'https://yt3.ggpht.com/-Gqi7IQdC_9s/AAAAAAAAAAI/AAAAAAAAAAA/nQZn4aCQ-ZA/s88-c-k-no/photo.jpg' } },
                                                               { description: 'New Video! Check out Haley Reinhart\'s beautifully haunting rendition of our \nvintage arrangement of Radiohead\'s \"Creep,\" and get ready for some chills. \n\nSee PMJ on tour in North America this Spring: http://www.pmjlive.com',
                                                                 date:        1428438215000,
                                                                 channel:     { id:    'UCORIeT1hk6tYBuntEXsguLg',
                                                                                name:  'ScottBradleeLovesYa',
                                                                                image: 'https://yt3.ggpht.com/-Gqi7IQdC_9s/AAAAAAAAAAI/AAAAAAAAAAA/nQZn4aCQ-ZA/s88-c-k-no/photo.jpg' } },
                                                               { description: 'New Video! Check out Haley Reinhart\'s beautifully haunting rendition of our \nvintage arrangement of Radiohead\'s \"Creep,\" and get ready for some chills. \n\nSee PMJ on tour in North America this Spring: http://www.pmjlive.com',
                                                                 date:        1428438215000,
                                                                 channel:     { id:    'UCORIeT1hk6tYBuntEXsguLg',
                                                                                name:  'ScottBradleeLovesYa',
                                                                                image: 'https://yt3.ggpht.com/-Gqi7IQdC_9s/AAAAAAAAAAI/AAAAAAAAAAA/nQZn4aCQ-ZA/s88-c-k-no/photo.jpg' } },
                                                               { description: 'New Video! Check out Haley Reinhart\'s beautifully haunting rendition of our \nvintage arrangement of Radiohead\'s \"Creep,\" and get ready for some chills. \n\nSee PMJ on tour in North America this Spring: http://www.pmjlive.com',
                                                                 date:        1428438215000,
                                                                 channel:     { id:    'UCORIeT1hk6tYBuntEXsguLg',
                                                                                name:  'ScottBradleeLovesYa',
                                                                                image: 'https://yt3.ggpht.com/-Gqi7IQdC_9s/AAAAAAAAAAI/AAAAAAAAAAA/nQZn4aCQ-ZA/s88-c-k-no/photo.jpg' } }] }];
                        });
                    }, 333);
                });
            }
        };
    });
});
