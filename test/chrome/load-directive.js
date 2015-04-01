'use strict';

describe('load-directive', function() {
    var sandbox = sinon.sandbox.create();
    var angular;
    var $compile;
    var $rootScope;

    beforeEach(function(done) {
        require(['angular', 'load-directive'], function(_angular) {
            sandbox.stub(chrome.runtime, 'sendMessage');
            angular = _angular;
            done();
        });
    });
    beforeEach(module('app'));
    beforeEach(inject(function(_$compile_, _$rootScope_) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
    }));

    afterEach(function() {
        sandbox.restore();
    });

    it('should send message', function() {
        var element = angular.element('<div load provider="somewhere" content="something" id="id" object="object" err="err"></div>');

        $rootScope.id = 'SOME_ID';
        $compile(element)($rootScope);
        $rootScope.$digest();

        expect(chrome.runtime.sendMessage).to.have.been.calledWith({ msg: 'data', provider: 'somewhere', content: 'something', id: 'SOME_ID' }, sinon.match.func);
    });

    it('should set scope object on message response', function() {
        var element = angular.element('<div load provider="somewhere" content="something" id="id" object="object" err="err"></div>');

        $rootScope.id = 'SOME_ID';
        $compile(element)($rootScope);
        $rootScope.$digest();

        chrome.runtime.sendMessage.yield({ some:    'attribute',
                                           another: 'thing' });
        $rootScope.$digest();

        expect($rootScope.object).to.deep.equal({ some:    'attribute',
                                                  another: 'thing' });
    });

    it('should set scope err on message err', function() {
        var element = angular.element('<div load provider="somewhere" content="something" id="id" object="object" err="err"></div>');

        $rootScope.id = 'SOME_ID';
        $compile(element)($rootScope);
        $rootScope.$digest();

        chrome.runtime.sendMessage.yield({ err: 'someerror' });
        $rootScope.$digest();

        expect($rootScope.err).to.equal('someerror');
    });
});
