'use strict';

describe('discussions-directive', function() {
    var sandbox = sinon.sandbox.create();
    var element;
    var $compile;
    var $rootScope;
    var scope;

    beforeEach(function(done) {
        require(['discussions-directive'], function() {
            done();
        });
    });
    beforeEach(module('app'));
    beforeEach(inject(function(_$compile_, _$rootScope_) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
    }));
    beforeEach(function(done) {
        require(['angular'], function(angular) {
            sandbox.useFakeServer();

            element = angular.element('<div discussions="discussions" request="request"></div>');
            $compile(element)($rootScope);
            $rootScope.$digest();
            scope = element.isolateScope();
            done();
        });
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('should two way bind discussions', function() {
        $rootScope.discussions = 'Out => In';
        $rootScope.$digest();
        expect(scope.discussions).to.equal('Out => In');

        scope.discussions = 'In => Out';
        $rootScope.$digest();
        expect($rootScope.discussions).to.equal('In => Out');
    });

    it('should two way bind request', function() {
        $rootScope.request = 'Out => In';
        $rootScope.$digest();
        expect(scope.request).to.equal('Out => In');

        scope.request = 'In => Out';
        $rootScope.$digest();
        expect($rootScope.request).to.equal('In => Out');
    });

    describe('on request', function() {
        it('should empty discussions', function() {
            $rootScope.request = 'Something';
            $rootScope.$digest();
            $rootScope.discussions = 'Something';
            $rootScope.$digest();
            $rootScope.request = 'Something Else';
            $rootScope.$digest();

            expect($rootScope.discussions).to.be.an('array');
            expect($rootScope.discussions).to.be.empty;
        });

        it('should unset people if null', function() {
            $rootScope.request = 'Something';
            $rootScope.$digest();
            $rootScope.discussions = 'Something';
            $rootScope.$digest();
            $rootScope.request = null;
            $rootScope.$digest();

            expect($rootScope.discussions).not.to.exist;
        });

        // TODO Make this streaming
        it('should set content with server response', function() {
            $rootScope.request = { type: 'youtube-video', id: 'm3lF2qEA2cw' };
            $rootScope.$digest();
            var response = [{ type:     'youtube-comments',
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
            sandbox.server.respond('GET',
                                   'https://hovercards.herokuapp.com/v1/discussions/youtube-video/m3lF2qEA2cw',
                                   [200, { 'Content-Type': 'application/json' }, JSON.stringify(response)]);
            $rootScope.$digest();

            expect($rootScope.discussions).to.deep.equal(response);
        });
    });
});
