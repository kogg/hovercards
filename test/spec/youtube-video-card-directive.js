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

        scope.id.should.equal('SOME_ID');
    });

    it('should bring channel id into scope', function() {
        var element = angular.element('<div youtube-video youtube-channel-id="channelID"></div>');
        var scope;

        $rootScope.channelID = 'SOME_ID';
        $compile(element)($rootScope);
        $rootScope.$digest();
        scope = element.isolateScope();

        scope.channelId.should.equal('SOME_ID');
    });

    it('should send youtube api message', function() {
        var element = angular.element('<div youtube-video youtube-video-id="videoID"></div>');

        $rootScope.videoID = 'SOME_ID';
        $compile(element)($rootScope);
        $rootScope.$digest();

        chrome.runtime.sendMessage.should.have.been.calledWith({ msg: 'api', content: 'youtube-video', id: 'SOME_ID' }, sinon.match.func);
    });

    it('should set scope properties to youtube api response', function() {
        var element = angular.element('<div youtube-video youtube-video-id="videoID" youtube-channel-id="channelID"></div>');
        var scope;

        $rootScope.videoID = 'SOME_ID';
        $compile(element)($rootScope);
        $rootScope.$digest();

        chrome.runtime.sendMessage.yield(null, { image:      'image.jpg',
                                                 title:      'Some Title',
                                                 description: 'Some Description',
                                                 date:        1302060119000,
                                                 views:       1000,
                                                 likes:       2000,
                                                 dislikes:    3000,
                                                 channelId:   'SOME_CHANNEL_ID' });
        $rootScope.$digest();
        scope = element.isolateScope();

        scope.image.should.equal('image.jpg');
        scope.title.should.equal('Some Title');
        scope.description.should.equal('Some Description');
        scope.date.should.equal(1302060119000);
        scope.views.should.equal(1000);
        scope.likes.should.equal(2000);
        scope.dislikes.should.equal(3000);
        scope.channelId.should.equal('SOME_CHANNEL_ID');
    });

    it('should set root scope channelID to youtube api response', function() {
        var element = angular.element('<div youtube-video youtube-video-id="videoID" youtube-channel-id="channelID"></div>');

        $rootScope.videoID = 'SOME_ID';
        $compile(element)($rootScope);
        $rootScope.$digest();

        chrome.runtime.sendMessage.yield(null, { image:      'image.jpg',
                                                 title:      'Some Title',
                                                 description: 'Some Description',
                                                 date:        1302060119000,
                                                 views:       1000,
                                                 likes:       2000,
                                                 dislikes:    3000,
                                                 channelId:   'SOME_CHANNEL_ID' });
        $rootScope.$digest();

        $rootScope.channelID.should.equal('SOME_CHANNEL_ID');
    });
});
