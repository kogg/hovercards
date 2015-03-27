'use strict';

describe('youtube-channel-card-directive', function() {
    var sandbox = sinon.sandbox.create();
    var angular;
    var $compile;
    var $rootScope;

    beforeEach(function(done) {
        require(['angular', 'youtube-channel-card-directive'], function(_angular) {
            sandbox.stub(chrome.runtime, 'sendMessage');
            angular = _angular;
            done();
        });
    });
    beforeEach(module('app'));
    beforeEach(inject(function(_$compile_, _$rootScope_, $templateCache) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        $templateCache.put('templates/youtube-channel-card.html', '<div></div>');
    }));

    afterEach(function() {
        sandbox.restore();
    });

    it('should bring channel id into scope', function() {
        var element = angular.element('<div youtube-channel youtube-channel-id="channelID"></div>');
        var scope;

        $rootScope.channelID = 'SOME_ID';
        $compile(element)($rootScope);
        $rootScope.$digest();
        scope = element.isolateScope();

        expect(scope.id).to.equal('SOME_ID');
    });

    it('should send youtube', function() {
        var element = angular.element('<div youtube-channel youtube-channel-id="channelID"></div>');

        $rootScope.channelID = 'SOME_ID';
        $compile(element)($rootScope);
        $rootScope.$digest();

        expect(chrome.runtime.sendMessage).to.have.been.calledWith({ msg: 'youtube', content: 'youtube-channel', id: 'SOME_ID' }, sinon.match.func);
    });

    it('should set scope properties to youtube response', function() {
        var element = angular.element('<div youtube-channel youtube-channel-id="channelID"></div>');
        var scope;

        $rootScope.channelID = 'SOME_ID';
        $compile(element)($rootScope);
        $rootScope.$digest();

        chrome.runtime.sendMessage.yield({ image:      'image.jpg',
                                           title:      'Some Title',
                                           description: 'Some Description',
                                           videos:      1000,
                                           views:       2000,
                                           subscribers: 3000 });
        $rootScope.$digest();
        scope = element.isolateScope();

        expect(scope.image).to.equal('image.jpg');
        expect(scope.title).to.equal('Some Title');
        expect(scope.description).to.equal('Some Description');
        expect(scope.videos).to.equal(1000);
        expect(scope.views).to.equal(2000);
        expect(scope.subscribers).to.equal(3000);
    });

    it('should set loaded to true', function() {
        var element = angular.element('<div youtube-channel youtube-channel-id="channelID"></div>');
        var scope;

        $rootScope.channelID = 'SOME_ID';
        $compile(element)($rootScope);
        $rootScope.$digest();

        chrome.runtime.sendMessage.yield({ image:      'image.jpg',
                                           title:      'Some Title',
                                           description: 'Some Description',
                                           videos:      1000,
                                           views:       2000,
                                           subscribers: 3000 });
        $rootScope.$digest();
        scope = element.isolateScope();

        expect(scope.loaded).to.be.true;
    });
});
