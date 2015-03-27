'use strict';

describe('youtube-user-image-directive', function() {
    var sandbox = sinon.sandbox.create();
    var angular;
    var $compile;
    var $rootScope;

    beforeEach(function(done) {
        require(['angular', 'youtube-user-image-directive'], function(_angular) {
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

    it('should bring video id into scope', function() {
        var element = angular.element('<div youtube-user-image youtube-user-id="userID"></div>');
        var scope;

        $rootScope.userID = 'SOME_ID';
        $compile(element)($rootScope);
        $rootScope.$digest();
        scope = element.isolateScope();

        expect(scope.id).to.equal('SOME_ID');
    });

    it('should send youtube for youtube-user-v2', function() {
        var element = angular.element('<div youtube-user-image youtube-user-id="userID"></div>');

        $rootScope.userID = 'SOME_ID';
        $compile(element)($rootScope);
        $rootScope.$digest();

        expect(chrome.runtime.sendMessage).to.have.been.calledWith({ msg: 'youtube', content: 'youtube-user-v2', id: 'SOME_ID' }, sinon.match.func);
    });

    it('should set scope properties to youtube response', function() {
        var element = angular.element('<div youtube-user-image youtube-user-id="userID"></div>');
        var scope;

        $rootScope.userID = 'SOME_ID';
        $compile(element)($rootScope);
        $rootScope.$digest();

        chrome.runtime.sendMessage.yield({ image: 'image.jpg' });
        $rootScope.$digest();
        scope = element.isolateScope();

        expect(scope.image).to.equal('image.jpg');
    });
});
