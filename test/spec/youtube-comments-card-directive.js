'use strict';

describe('youtube-comments-card-directive', function() {
    var sandbox = sinon.sandbox.create();
    var angular;
    var $compile;
    var $rootScope;

    beforeEach(function(done) {
        require(['angular', 'youtube-comments-card-directive'], function(_angular) {
            sandbox.stub(chrome.runtime, 'sendMessage');
            angular = _angular;
            done();
        });
    });
    beforeEach(module('app'));
    beforeEach(inject(function(_$compile_, _$rootScope_, $templateCache) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        $templateCache.put('templates/youtube-comments-card.html', '<div></div>');
    }));

    afterEach(function() {
        sandbox.restore();
    });

    it('should bring video id into scope', function() {
        var element = angular.element('<div youtube-comments youtube-video-id="videoID"></div>');
        var scope;

        $rootScope.videoID = 'SOME_ID';
        $compile(element)($rootScope);
        $rootScope.$digest();
        scope = element.isolateScope();

        scope.id.should.equal('SOME_ID');
    });

    it('should send youtube message', function() {
        var element = angular.element('<div youtube-comments youtube-video-id="videoID"></div>');

        $rootScope.videoID = 'SOME_ID';
        $compile(element)($rootScope);
        $rootScope.$digest();

        chrome.runtime.sendMessage.should.have.been.calledWith({ msg: 'youtube', content: 'youtube-comments', id: 'SOME_ID' }, sinon.match.func);
    });

    it('should set scope properties to youtube response', function() {
        var element = angular.element('<div youtube-comments youtube-video-id="videoID"></div>');
        var scope;

        $rootScope.videoID = 'SOME_ID';
        $compile(element)($rootScope);
        $rootScope.$digest();

        chrome.runtime.sendMessage.yield({ comments: [{ name:      'Author Name 1',
                                                        image:     'image1.jpg',
                                                        date:      1426980181001,
                                                        content:   'Some Content 1',
                                                        channelId: 'SOME_CHANNEL_ID_1' },
                                                      { name:      'Author Name 2',
                                                        image:     'image2.jpg',
                                                        date:      1426980181002,
                                                        content:   'Some Content 2',
                                                        channelId: 'SOME_CHANNEL_ID_2' },
                                                      { name:      'Author Name 3',
                                                        image:     'image3.jpg',
                                                        date:      1426980181003,
                                                        content:   'Some Content 3',
                                                        channelId: 'SOME_CHANNEL_ID_3' },
                                                      { name:      'Author Name 4',
                                                        image:     'image4.jpg',
                                                        date:      1426980181004,
                                                        content:   'Some Content 4',
                                                        channelId: 'SOME_CHANNEL_ID_4' },
                                                      { name:      'Author Name 5',
                                                        image:     'image5.jpg',
                                                        date:      1426980181005,
                                                        content:   'Some Content 5',
                                                        channelId: 'SOME_CHANNEL_ID_5' }] });
        $rootScope.$digest();
        scope = element.isolateScope();

        scope.comments.should.be.a('array');

        scope.comments[0].name.should.equal('Author Name 1');
        scope.comments[0].image.should.equal('image1.jpg');
        scope.comments[0].date.should.equal(1426980181001);
        scope.comments[0].content.should.equal('Some Content 1');
        scope.comments[0].channelId.should.equal('SOME_CHANNEL_ID_1');

        scope.comments[1].name.should.equal('Author Name 2');
        scope.comments[1].image.should.equal('image2.jpg');
        scope.comments[1].date.should.equal(1426980181002);
        scope.comments[1].content.should.equal('Some Content 2');
        scope.comments[1].channelId.should.equal('SOME_CHANNEL_ID_2');

        scope.comments[2].name.should.equal('Author Name 3');
        scope.comments[2].image.should.equal('image3.jpg');
        scope.comments[2].date.should.equal(1426980181003);
        scope.comments[2].content.should.equal('Some Content 3');
        scope.comments[2].channelId.should.equal('SOME_CHANNEL_ID_3');

        scope.comments[3].name.should.equal('Author Name 4');
        scope.comments[3].image.should.equal('image4.jpg');
        scope.comments[3].date.should.equal(1426980181004);
        scope.comments[3].content.should.equal('Some Content 4');
        scope.comments[3].channelId.should.equal('SOME_CHANNEL_ID_4');

        scope.comments[4].name.should.equal('Author Name 5');
        scope.comments[4].image.should.equal('image5.jpg');
        scope.comments[4].date.should.equal(1426980181005);
        scope.comments[4].content.should.equal('Some Content 5');
        scope.comments[4].channelId.should.equal('SOME_CHANNEL_ID_5');
    });
});
