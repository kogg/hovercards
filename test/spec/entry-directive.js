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
            sandbox.useFakeTimers();
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

    describe('on load', function() {
        it('should empty entry', function() {
            $rootScope.entry = 'Something';
            $rootScope.$digest();
            chrome.runtime.onMessage.addListener.yield({ msg: 'load', url: 'URL' });
            $rootScope.$digest();

            expect($rootScope.entry).not.to.exist;
        });

        describe('youtube video URLs', function() {
            it('should identify www.youtube.com/watch?v=VIDEO_ID in 100ms', function() {
                chrome.runtime.onMessage.addListener.yield({ msg: 'load', url: 'https://www.youtube.com/watch?v=VIDEO_ID' });
                $rootScope.$digest();
                sandbox.clock.tick(100);
                $rootScope.$digest();

                expect($rootScope.entry).to.have.deep.property('content.type', 'youtube-video');
                expect($rootScope.entry).to.have.deep.property('content.id',   'VIDEO_ID');
                expect($rootScope.entry.discussions).to.contain({ type: 'youtube-comments', id: 'VIDEO_ID' });
                expect($rootScope.entry.discussions).to.contain({ type: 'reddit-comments', id: 'youtube_VIDEO_ID' });
            });

            it('should identify m.youtube.com/watch?v=VIDEO_ID in 100ms', function() {
                chrome.runtime.onMessage.addListener.yield({ msg: 'load', url: 'https://m.youtube.com/watch?v=VIDEO_ID' });
                $rootScope.$digest();
                sandbox.clock.tick(100);
                $rootScope.$digest();

                expect($rootScope.entry).to.have.deep.property('content.type', 'youtube-video');
                expect($rootScope.entry).to.have.deep.property('content.id',   'VIDEO_ID');
                expect($rootScope.entry.discussions).to.contain({ type: 'youtube-comments', id: 'VIDEO_ID' });
                expect($rootScope.entry.discussions).to.contain({ type: 'reddit-comments', id: 'youtube_VIDEO_ID' });
            });

            it('should identify www.youtube.com/v/VIDEO_ID in 100ms', function() {
                chrome.runtime.onMessage.addListener.yield({ msg: 'load', url: 'https://www.youtube.com/v/VIDEO_ID' });
                $rootScope.$digest();
                sandbox.clock.tick(100);
                $rootScope.$digest();

                expect($rootScope.entry).to.have.deep.property('content.type', 'youtube-video');
                expect($rootScope.entry).to.have.deep.property('content.id',   'VIDEO_ID');
                expect($rootScope.entry.discussions).to.contain({ type: 'youtube-comments', id: 'VIDEO_ID' });
                expect($rootScope.entry.discussions).to.contain({ type: 'reddit-comments', id: 'youtube_VIDEO_ID' });
            });

            it('should identify www.youtube.com/embed/VIDEO_ID in 100ms', function() {
                chrome.runtime.onMessage.addListener.yield({ msg: 'load', url: 'https://www.youtube.com/embed/VIDEO_ID' });
                $rootScope.$digest();
                sandbox.clock.tick(100);
                $rootScope.$digest();

                expect($rootScope.entry).to.have.deep.property('content.type', 'youtube-video');
                expect($rootScope.entry).to.have.deep.property('content.id',   'VIDEO_ID');
                expect($rootScope.entry.discussions).to.contain({ type: 'youtube-comments', id: 'VIDEO_ID' });
                expect($rootScope.entry.discussions).to.contain({ type: 'reddit-comments', id: 'youtube_VIDEO_ID' });
            });

            it('should identify www.youtu.be/VIDEO_ID in 100ms', function() {
                chrome.runtime.onMessage.addListener.yield({ msg: 'load', url: 'https://www.youtu.be/VIDEO_ID' });
                $rootScope.$digest();
                sandbox.clock.tick(100);
                $rootScope.$digest();

                expect($rootScope.entry).to.have.deep.property('content.type', 'youtube-video');
                expect($rootScope.entry).to.have.deep.property('content.id',   'VIDEO_ID');
                expect($rootScope.entry.discussions).to.contain({ type: 'youtube-comments', id: 'VIDEO_ID' });
                expect($rootScope.entry.discussions).to.contain({ type: 'reddit-comments', id: 'youtube_VIDEO_ID' });
            });
        });

        describe('youtube channel URLs', function() {
            it('should identify www.youtube.com/channel/CHANNEL_ID in 100ms', function() {
                chrome.runtime.onMessage.addListener.yield({ msg: 'load', url: 'https://www.youtube.com/channel/CHANNEL_ID' });
                $rootScope.$digest();
                sandbox.clock.tick(100);
                $rootScope.$digest();

                expect($rootScope.entry.accounts).to.be.an('array');
                expect($rootScope.entry.accounts).to.be.contain({ type: 'youtube-channel', id: 'CHANNEL_ID' });
            });
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
