'use strict';

describe('people-directive', function() {
    var sandbox = sinon.sandbox.create();
    var element;
    var $compile;
    var $rootScope;
    var scope;

    beforeEach(function(done) {
        require(['people-directive'], function() {
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

            element = angular.element('<div people="people" request="request"></div>');
            $compile(element)($rootScope);
            $rootScope.$digest();
            scope = element.isolateScope();
            done();
        });
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('should two way bind people', function() {
        $rootScope.people = 'Out => In';
        $rootScope.$digest();
        expect(scope.people).to.equal('Out => In');

        scope.people = 'In => Out';
        $rootScope.$digest();
        expect($rootScope.people).to.equal('In => Out');
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
        it('should empty people', function() {
            $rootScope.request = 'Something';
            $rootScope.$digest();
            $rootScope.people = 'Something';
            $rootScope.$digest();
            $rootScope.request = 'Something Else';
            $rootScope.$digest();

            expect($rootScope.people).not.to.exist;
        });

        it('should set accounts', function() {
            $rootScope.request = [{ type: 'youtube-channel', id: 'UCXMwB3cyA75bh4QI4pbeHgw' }];
            $rootScope.$digest();
            var response = [{ type:        'youtube-channel',
                              id:          'UCORIeT1hk6tYBuntEXsguLg',
                              image:       'https://yt3.ggpht.com/-Gqi7IQdC_9s/AAAAAAAAAAI/AAAAAAAAAAA/nQZn4aCQ-ZA/s240-c-k-no/photo.jpg',
                              name:        'ScottBradleeLovesYa',
                              description: 'An alternate universe of pop music.\nSnapchat: scottbradlee\nTwitter / Insta: scottbradlee\n\niTunes: https://itunes.apple.com/us/artist/scott-bradlee-postmodern-jukebox/id636865970\n\n\n\nPMJ Tour Tix: http://www.PMJLive.com\nThe Great Impression Tour: 2015 North American Dates on sale now\n\n\nWebsite:  http://www.postmodernjukebox.com\nMy Patreon:  http://www.patreon.com/scottbradlee\nTwitter / Instagram / Vine: @scottbradlee\n\n"Like" me!\nhttp://www.facebook.com/scottbradleemusic\n\nand Postmodern Jukebox:\nhttp://www.facebook.com/postmodernjukebox',
                              subscribers: 1063079,
                              videos:      138,
                              views:       199361777 }];
            sandbox.server.respond('GET',
                                   'https://hovercards.herokuapp.com/v1/accounts?accounts%5B0%5D%5Btype%5D=youtube-channel&accounts%5B0%5D%5Bid%5D=UCXMwB3cyA75bh4QI4pbeHgw',
                                   [200, { 'Content-Type': 'application/json' }, JSON.stringify(response)]);
            $rootScope.$digest();

            expect($rootScope.people[0].accounts).to.deep.equal(response);
        });

        it('should set the person\'s selectedAccount to the first account', function() {
            $rootScope.request = [{ type: 'youtube-channel', id: 'UCXMwB3cyA75bh4QI4pbeHgw' }];
            $rootScope.$digest();
            var response = [{ type:        'youtube-channel',
                              id:          'UCORIeT1hk6tYBuntEXsguLg',
                              image:       'https://yt3.ggpht.com/-Gqi7IQdC_9s/AAAAAAAAAAI/AAAAAAAAAAA/nQZn4aCQ-ZA/s240-c-k-no/photo.jpg',
                              name:        'ScottBradleeLovesYa',
                              description: 'An alternate universe of pop music.\nSnapchat: scottbradlee\nTwitter / Insta: scottbradlee\n\niTunes: https://itunes.apple.com/us/artist/scott-bradlee-postmodern-jukebox/id636865970\n\n\n\nPMJ Tour Tix: http://www.PMJLive.com\nThe Great Impression Tour: 2015 North American Dates on sale now\n\n\nWebsite:  http://www.postmodernjukebox.com\nMy Patreon:  http://www.patreon.com/scottbradlee\nTwitter / Instagram / Vine: @scottbradlee\n\n"Like" me!\nhttp://www.facebook.com/scottbradleemusic\n\nand Postmodern Jukebox:\nhttp://www.facebook.com/postmodernjukebox',
                              subscribers: 1063079,
                              videos:      138,
                              views:       199361777 }];
            sandbox.server.respond('GET',
                                   'https://hovercards.herokuapp.com/v1/accounts?accounts%5B0%5D%5Btype%5D=youtube-channel&accounts%5B0%5D%5Bid%5D=UCXMwB3cyA75bh4QI4pbeHgw',
                                   [200, { 'Content-Type': 'application/json' }, JSON.stringify(response)]);
            $rootScope.$digest();

            expect($rootScope.people[0].selectedAccount).to.equal($rootScope.people[0].accounts[0]);
        });
    });
});
