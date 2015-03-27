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

        expect(scope.id).to.equal('SOME_ID');
    });

    it('should send youtube for youtube-comments-v2', function() {
        var element = angular.element('<div youtube-comments youtube-video-id="videoID"></div>');

        $rootScope.videoID = 'SOME_ID';
        $compile(element)($rootScope);
        $rootScope.$digest();

        expect(chrome.runtime.sendMessage).to.have.been.calledWith({ msg: 'youtube', content: 'youtube-comments-v2', id: 'SOME_ID' }, sinon.match.func);
    });

    it('should set scope properties to youtube response', function() {
        var element = angular.element('<div youtube-comments youtube-video-id="videoID"></div>');
        var scope;

        $rootScope.videoID = 'SOME_ID';
        $compile(element)($rootScope);
        $rootScope.$digest();

        chrome.runtime.sendMessage.yield({ comments: [{ name:      'Author Name 1',
                                                        userId:    'USER_ID_1',
                                                        date:      1426980181000,
                                                        content:   'Some Content 1',
                                                        channelId: 'SOME_CHANNEL_ID_1' },
                                                      { name:      'Author Name 2',
                                                        userId:    'USER_ID_2',
                                                        date:      1427066581000,
                                                        content:   'Some Content 2',
                                                        channelId: 'SOME_CHANNEL_ID_2' },
                                                      { name:      'Author Name 3',
                                                        userId:    'USER_ID_3',
                                                        date:      1427152981000,
                                                        content:   'Some Content 3',
                                                        channelId: 'SOME_CHANNEL_ID_3' },
                                                      { name:      'Author Name 4',
                                                        userId:    'USER_ID_4',
                                                        date:      1427239381000,
                                                        content:   'Some Content 4',
                                                        channelId: 'SOME_CHANNEL_ID_4' },
                                                      { name:      'Author Name 5',
                                                        userId:    'USER_ID_5',
                                                        date:      1427325781000,
                                                        content:   'Some Content 5',
                                                        channelId: 'SOME_CHANNEL_ID_5' }] });
        $rootScope.$digest();
        scope = element.isolateScope();

        expect(scope.comments).to.deep.equal([{ name:      'Author Name 1',
                                                userId:    'USER_ID_1',
                                                date:      1426980181000,
                                                content:   'Some Content 1',
                                                channelId: 'SOME_CHANNEL_ID_1' },
                                              { name:      'Author Name 2',
                                                userId:    'USER_ID_2',
                                                date:      1427066581000,
                                                content:   'Some Content 2',
                                                channelId: 'SOME_CHANNEL_ID_2' },
                                              { name:      'Author Name 3',
                                                userId:    'USER_ID_3',
                                                date:      1427152981000,
                                                content:   'Some Content 3',
                                                channelId: 'SOME_CHANNEL_ID_3' },
                                              { name:      'Author Name 4',
                                                userId:    'USER_ID_4',
                                                date:      1427239381000,
                                                content:   'Some Content 4',
                                                channelId: 'SOME_CHANNEL_ID_4' },
                                              { name:      'Author Name 5',
                                                userId:    'USER_ID_5',
                                                date:      1427325781000,
                                                content:   'Some Content 5',
                                                channelId: 'SOME_CHANNEL_ID_5' }]);
    });

    it('should set loaded to true', function() {
        var element = angular.element('<div youtube-comments youtube-video-id="videoID"></div>');
        var scope;

        $rootScope.videoID = 'SOME_ID';
        $compile(element)($rootScope);
        $rootScope.$digest();

        chrome.runtime.sendMessage.yield({ comments: [{ name:      'Author Name 1',
                                                        userId:    'USER_ID_1',
                                                        date:      1426980181000,
                                                        content:   'Some Content 1',
                                                        channelId: 'SOME_CHANNEL_ID_1' },
                                                      { name:      'Author Name 2',
                                                        userId:    'USER_ID_2',
                                                        date:      1427066581000,
                                                        content:   'Some Content 2',
                                                        channelId: 'SOME_CHANNEL_ID_2' },
                                                      { name:      'Author Name 3',
                                                        userId:    'USER_ID_3',
                                                        date:      1427152981000,
                                                        content:   'Some Content 3',
                                                        channelId: 'SOME_CHANNEL_ID_3' },
                                                      { name:      'Author Name 4',
                                                        userId:    'USER_ID_4',
                                                        date:      1427239381000,
                                                        content:   'Some Content 4',
                                                        channelId: 'SOME_CHANNEL_ID_4' },
                                                      { name:      'Author Name 5',
                                                        userId:    'USER_ID_5',
                                                        date:      1427325781000,
                                                        content:   'Some Content 5',
                                                        channelId: 'SOME_CHANNEL_ID_5' }] });
        $rootScope.$digest();
        scope = element.isolateScope();

        expect(scope.loaded).to.be.true;
    });
});
