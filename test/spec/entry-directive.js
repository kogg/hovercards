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
            sandbox.stub(chrome.runtime.onMessage, 'addListener');
            sandbox.useFakeTimers();
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

        // TODO Load stuff from server
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
