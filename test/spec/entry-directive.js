'use strict';

describe('entry-directive', function() {
    var sandbox = sinon.sandbox.create();
    var element;
    var $compile;
    var $rootScope;
    var scope;

    beforeEach(function(done) {
        require(['entry-directive'], function() {
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
            sandbox.stub(chrome.runtime.onMessage, 'addListener');
            element = angular.element('<div entry="entry"></div>');

            $compile(element)($rootScope);
            $rootScope.$digest();
            scope = element.isolateScope();
            done();
        });
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('should two way bind entry', function() {
        $rootScope.entry = 'Out => In';
        $rootScope.$digest();
        expect(scope.entry).to.equal('Out => In');

        scope.entry = 'In => Out';
        $rootScope.$digest();
        expect($rootScope.entry).to.equal('In => Out');
    });

    describe('on load', function() {
        it('should empty entry', function() {
            $rootScope.entry = 'Something';
            $rootScope.$digest();
            chrome.runtime.onMessage.addListener.yield({ msg: 'load', url: 'URL' });
            $rootScope.$digest();

            expect($rootScope.entry).not.to.exist;
        });

        it('should set entry with server response', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'load', url: 'URL' });
            $rootScope.$digest();
            sandbox.server.respond('GET',
                                   'https://hovercards.herokuapp.com/v1/identify?url=URL',
                                   [200, { 'Content-Type': 'application/json' }, '{"content":{"type":"youtube-video","id":"m3lF2qEA2cw"}}']);
            $rootScope.$digest();

            expect($rootScope.entry).to.deep.equal({ content: { type: 'youtube-video', id: 'm3lF2qEA2cw' } });
        });
    });

    describe('on hide', function() {
        it('should empty entry', function() {
            $rootScope.entry = 'Something';
            $rootScope.$digest();
            chrome.runtime.onMessage.addListener.yield({ msg: 'hide' });
            $rootScope.$digest();

            expect($rootScope.entry).not.to.exist;
        });
    });
});
