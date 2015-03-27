'use strict';

describe('youtube-video-card-directive', function() {
    var sandbox = sinon.sandbox.create();
    var angular;
    var $compile;
    var $rootScope;

    beforeEach(function(done) {
        require(['angular', 'youtube-video-card-directive'], function(_angular) {
            sandbox.stub(chrome.runtime, 'sendMessage');
            angular = _angular;
            done();
        });
    });
    beforeEach(module('app'));
    beforeEach(inject(function(_$compile_, _$rootScope_, $templateCache) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        $templateCache.put('templates/youtube-video-card.html', '<div></div>');
    }));

    afterEach(function() {
        sandbox.restore();
    });

    it('should bring video id into scope', function() {
        var element = angular.element('<div youtube-video youtube-video-id="videoID"></div>');
        var scope;

        $rootScope.videoID = 'SOME_ID';
        $compile(element)($rootScope);
        $rootScope.$digest();
        scope = element.isolateScope();

        expect(scope.id).to.equal('SOME_ID');
    });

    it('should bring channel id into scope', function() {
        var element = angular.element('<div youtube-video youtube-channel-id="channelID"></div>');
        var scope;

        $rootScope.channelID = 'SOME_ID';
        $compile(element)($rootScope);
        $rootScope.$digest();
        scope = element.isolateScope();

        expect(scope.channelId).to.equal('SOME_ID');
    });

    it('should send youtube', function() {
        var element = angular.element('<div youtube-video youtube-video-id="videoID"></div>');

        $rootScope.videoID = 'SOME_ID';
        $compile(element)($rootScope);
        $rootScope.$digest();

        expect(chrome.runtime.sendMessage).to.have.been.calledWith({ msg: 'youtube', content: 'youtube-video', id: 'SOME_ID' }, sinon.match.func);
    });

    it('should set scope properties to youtube response', function() {
        var element = angular.element('<div youtube-video youtube-video-id="videoID" youtube-channel-id="channelID"></div>');
        var scope;

        $rootScope.videoID = 'SOME_ID';
        $compile(element)($rootScope);
        $rootScope.$digest();

        chrome.runtime.sendMessage.yield({ image:      'image.jpg',
                                           title:      'Some Title',
                                           description: 'Some Description',
                                           date:        1302060119000,
                                           views:       1000,
                                           likes:       2000,
                                           dislikes:    3000,
                                           channelId:   'SOME_CHANNEL_ID' });
        $rootScope.$digest();
        scope = element.isolateScope();

        expect(scope.image).to.equal('image.jpg');
        expect(scope.title).to.equal('Some Title');
        expect(scope.description).to.equal('Some Description');
        expect(scope.date).to.equal(1302060119000);
        expect(scope.views).to.equal(1000);
        expect(scope.likes).to.equal(2000);
        expect(scope.dislikes).to.equal(3000);
        expect(scope.channelId).to.equal('SOME_CHANNEL_ID');
    });

    it('should set loaded to true', function() {
        var element = angular.element('<div youtube-video youtube-video-id="videoID" youtube-channel-id="channelID"></div>');
        var scope;

        $rootScope.videoID = 'SOME_ID';
        $compile(element)($rootScope);
        $rootScope.$digest();

        chrome.runtime.sendMessage.yield({ image:      'image.jpg',
                                           title:      'Some Title',
                                           description: 'Some Description',
                                           date:        1302060119000,
                                           views:       1000,
                                           likes:       2000,
                                           dislikes:    3000,
                                           channelId:   'SOME_CHANNEL_ID' });
        $rootScope.$digest();
        scope = element.isolateScope();

        expect(scope.loaded).to.be.true;
    });

    it('should set root scope channelID to youtube response', function() {
        var element = angular.element('<div youtube-video youtube-video-id="videoID" youtube-channel-id="channelID"></div>');

        $rootScope.videoID = 'SOME_ID';
        $compile(element)($rootScope);
        $rootScope.$digest();

        chrome.runtime.sendMessage.yield({ image:      'image.jpg',
                                           title:      'Some Title',
                                           description: 'Some Description',
                                           date:        1302060119000,
                                           views:       1000,
                                           likes:       2000,
                                           dislikes:    3000,
                                           channelId:   'SOME_CHANNEL_ID' });
        $rootScope.$digest();

        expect($rootScope.channelID).to.equal('SOME_CHANNEL_ID');
    });
});
