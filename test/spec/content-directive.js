'use strict';

describe('content-directive', function() {
    var sandbox = sinon.sandbox.create();
    var element;
    var $compile;
    var $rootScope;
    var scope;

    beforeEach(function(done) {
        require(['content-directive'], function() {
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

            element = angular.element('<div content="content" request="request"></div>');
            $compile(element)($rootScope);
            $rootScope.$digest();
            scope = element.isolateScope();
            done();
        });
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('should two way bind content', function() {
        $rootScope.content = 'Out => In';
        $rootScope.$digest();
        expect(scope.content).to.equal('Out => In');

        scope.content = 'In => Out';
        $rootScope.$digest();
        expect($rootScope.content).to.equal('In => Out');
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
        it('should empty content', function() {
            $rootScope.request = 'Something';
            $rootScope.$digest();
            $rootScope.content = 'Something';
            $rootScope.$digest();
            $rootScope.request = 'Something Else';
            $rootScope.$digest();

            expect($rootScope.content).not.to.exist;
        });

        it('should set content with server response', function() {
            $rootScope.request = { type: 'youtube-video', id: 'm3lF2qEA2cw' };
            $rootScope.$digest();
            var response = { type:        'youtube-video',
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
            sandbox.server.respond('GET',
                                   'https://hovercards.herokuapp.com/v1/content/youtube-video/m3lF2qEA2cw',
                                   [200, { 'Content-Type': 'application/json' }, JSON.stringify(response)]);
            $rootScope.$digest();

            expect($rootScope.content).to.deep.equal(response);
        });
    });
});
