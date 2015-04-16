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
            var response = { content: { type: 'youtube-video', id: 'm3lF2qEA2cw' } };
            sandbox.server.respond('GET',
                                   'https://hovercards.herokuapp.com/v1/identify?url=URL',
                                   [200, { 'Content-Type': 'application/json' }, JSON.stringify(response)]);
            $rootScope.$digest();

            expect($rootScope.entry).to.deep.equal(response);
        });

        it('should set err', function() {
            chrome.runtime.onMessage.addListener.yield({ msg: 'load', url: 'URL' });
            $rootScope.$digest();
            sandbox.server.respond('GET',
                                   'https://hovercards.herokuapp.com/v1/identify?url=URL',
                                   [400, {}, 'Error Message']);
            $rootScope.$digest();

            expect($rootScope.entry.err).to.have.property('code', 400);
            expect($rootScope.entry.err).to.have.property('message', 'Error Message');
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
