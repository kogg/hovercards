'use strict';

describe('more-content-directive', function() {
    var sandbox = sinon.sandbox.create();
    var element;
    var $compile;
    var $rootScope;
    var scope;

    beforeEach(function(done) {
        require(['more-content-directive'], function() {
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

            element = angular.element('<div more-content="moreContent" request="request"></div>');
            $compile(element)($rootScope);
            $rootScope.$digest();
            scope = element.isolateScope();
            done();
        });
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('should two way bind moreContent', function() {
        $rootScope.moreContent = 'Out => In';
        $rootScope.$digest();
        expect(scope.moreContent).to.equal('Out => In');

        scope.moreContent = 'In => Out';
        $rootScope.$digest();
        expect($rootScope.moreContent).to.equal('In => Out');
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
        it('should empty moreContent', function() {
            $rootScope.request = 'Something';
            $rootScope.$digest();
            $rootScope.moreContent = 'Something';
            $rootScope.$digest();
            $rootScope.request = 'Something Else';
            $rootScope.$digest();

            expect($rootScope.moreContent).not.to.exist;
        });

        it('should set moreContent with server response', function() {
            $rootScope.request = { type: 'youtube-channel', id: 'CHANNEL_ID' };
            $rootScope.$digest();
            var response = { type:   'youtube-videos',
                             id:     'CHANNEL_ID',
                             videos: [{ name:        'Some Name 1',
                                        description: 'Some Description 1',
                                        date:        1428437477000,
                                        image:       'image1.jpg' },
                                      { name:        'Some Name 2',
                                        description: 'Some Description 2',
                                        date:        1428437477000,
                                        image:       'image2.jpg' }] };
            sandbox.server.respond('GET',
                                   'https://hovercards.herokuapp.com/v1/youtube-channel/CHANNEL_ID/content',
                                   [200, { 'Content-Type': 'application/json' }, JSON.stringify(response)]);
            $rootScope.$digest();

            expect($rootScope.moreContent).to.deep.equal(response);
        });

        // TODO Load stuff from server
    });
});
