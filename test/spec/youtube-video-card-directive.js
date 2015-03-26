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

        scope.videoID.should.equal('SOME_ID');
    });

    it('should bring channel id into scope', function() {
        var element = angular.element('<div youtube-video youtube-channel-id="channelID"></div>');
        var scope;

        $rootScope.channelID = 'SOME_ID';
        $compile(element)($rootScope);
        $rootScope.$digest();
        scope = element.isolateScope();

        scope.channelID.should.equal('SOME_ID');
    });

    it('should send youtube api message', function() {
        var element = angular.element('<div youtube-video youtube-video-id="videoID"></div>');

        $rootScope.videoID = 'SOME_ID';
        $compile(element)($rootScope);
        $rootScope.$digest();

        chrome.runtime.sendMessage.should.have.been.calledWith({ msg: 'api', content: 'youtube-video', id: 'SOME_ID' }, sinon.match.func);
    });
});
