'use strict';

describe('account-directive', function() {
    var sandbox = sinon.sandbox.create();
    var element;
    var $compile;
    var $rootScope;
    var scope;

    beforeEach(function(done) {
        require(['account-directive'], function() {
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

            element = angular.element('<div account="account" request="request"></div>');
            $compile(element)($rootScope);
            $rootScope.$digest();
            scope = element.isolateScope();
            done();
        });
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('should two way bind account', function() {
        $rootScope.account = 'Out => In';
        $rootScope.$digest();
        expect(scope.account).to.equal('Out => In');

        scope.account = 'In => Out';
        $rootScope.$digest();
        expect($rootScope.account).to.equal('In => Out');
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
        it('should empty account', function() {
            $rootScope.request = 'Something';
            $rootScope.$digest();
            $rootScope.account = 'Something';
            $rootScope.$digest();
            $rootScope.request = 'Something Else';
            $rootScope.$digest();

            expect($rootScope.account).not.to.exist;
        });

        it('should set account with server response', function() {
            $rootScope.request = { type: 'youtube-channel', id: 'UCXMwB3cyA75bh4QI4pbeHgw' };
            $rootScope.$digest();
            var response = { type:        'youtube-channel',
                             id:          'UCORIeT1hk6tYBuntEXsguLg',
                             image:       'https://yt3.ggpht.com/-Gqi7IQdC_9s/AAAAAAAAAAI/AAAAAAAAAAA/nQZn4aCQ-ZA/s240-c-k-no/photo.jpg',
                             name:        'ScottBradleeLovesYa',
                             description: 'An alternate universe of pop music.\nSnapchat: scottbradlee\nTwitter / Insta: scottbradlee\n\niTunes: https://itunes.apple.com/us/artist/scott-bradlee-postmodern-jukebox/id636865970\n\n\n\nPMJ Tour Tix: http://www.PMJLive.com\nThe Great Impression Tour: 2015 North American Dates on sale now\n\n\nWebsite:  http://www.postmodernjukebox.com\nMy Patreon:  http://www.patreon.com/scottbradlee\nTwitter / Instagram / Vine: @scottbradlee\n\n"Like" me!\nhttp://www.facebook.com/scottbradleemusic\n\nand Postmodern Jukebox:\nhttp://www.facebook.com/postmodernjukebox',
                             subscribers: 1063079,
                             videos:      138,
                             views:       199361777 };
            sandbox.server.respond('GET',
                                   'https://hovercards.herokuapp.com/v1/account/youtube-channel/UCXMwB3cyA75bh4QI4pbeHgw',
                                   [200, { 'Content-Type': 'application/json' }, JSON.stringify(response)]);
            $rootScope.$digest();

            expect($rootScope.account).to.deep.equal(response);
        });
    });
});
