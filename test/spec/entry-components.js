describe('entry-components', function() {
    var sandbox = sinon.sandbox.create();
    var $rootScope;
    var $scope;
    var $controller;

    beforeEach(module(require('../../app/scripts/entry-components')));
    beforeEach(inject(function(_$controller_, _$rootScope_) {
        $controller = _$controller_;
        $rootScope = _$rootScope_;
    }));
    beforeEach(function() {
        sandbox.useFakeTimers();
        sandbox.stub(window, 'addEventListener');

        $scope = $rootScope.$new();
        $controller('EntryController', { $scope: $scope });
    });

    afterEach(function() {
        sandbox.restore();
    });

    describe('on load', function() {
        it('should empty entry', function() {
            $scope.entry = 'Something';
            window.addEventListener.yield({ data: { msg: 'load', url: 'URL' } });

            expect($scope.entry).not.to.exist;
        });

        describe('youtube video URLs', function() {
            it('should identify www.youtube.com/watch?v=VIDEO_ID in 100ms', function() {
                window.addEventListener.yield({ data: { msg: 'load', url: 'https://www.youtube.com/watch?v=VIDEO_ID' } });
                sandbox.clock.tick(100);

                expect($scope.entry).to.have.deep.property('content.type', 'youtube-video');
                expect($scope.entry).to.have.deep.property('content.id',   'VIDEO_ID');
                expect($scope.entry.discussions).to.contain({ type: 'youtube-comments', id: 'VIDEO_ID' });
                expect($scope.entry.discussions).to.contain({ type: 'reddit-comments', id: 'youtube_VIDEO_ID' });
            });

            it('should identify m.youtube.com/watch?v=VIDEO_ID in 100ms', function() {
                window.addEventListener.yield({ data: { msg: 'load', url: 'https://m.youtube.com/watch?v=VIDEO_ID' } });
                sandbox.clock.tick(100);

                expect($scope.entry).to.have.deep.property('content.type', 'youtube-video');
                expect($scope.entry).to.have.deep.property('content.id',   'VIDEO_ID');
                expect($scope.entry.discussions).to.contain({ type: 'youtube-comments', id: 'VIDEO_ID' });
                expect($scope.entry.discussions).to.contain({ type: 'reddit-comments', id: 'youtube_VIDEO_ID' });
            });

            it('should identify www.youtube.com/v/VIDEO_ID in 100ms', function() {
                window.addEventListener.yield({ data: { msg: 'load', url: 'https://www.youtube.com/v/VIDEO_ID' } });
                sandbox.clock.tick(100);

                expect($scope.entry).to.have.deep.property('content.type', 'youtube-video');
                expect($scope.entry).to.have.deep.property('content.id',   'VIDEO_ID');
                expect($scope.entry.discussions).to.contain({ type: 'youtube-comments', id: 'VIDEO_ID' });
                expect($scope.entry.discussions).to.contain({ type: 'reddit-comments', id: 'youtube_VIDEO_ID' });
            });

            it('should identify www.youtube.com/embed/VIDEO_ID in 100ms', function() {
                window.addEventListener.yield({ data: { msg: 'load', url: 'https://www.youtube.com/embed/VIDEO_ID' } });
                sandbox.clock.tick(100);

                expect($scope.entry).to.have.deep.property('content.type', 'youtube-video');
                expect($scope.entry).to.have.deep.property('content.id',   'VIDEO_ID');
                expect($scope.entry.discussions).to.contain({ type: 'youtube-comments', id: 'VIDEO_ID' });
                expect($scope.entry.discussions).to.contain({ type: 'reddit-comments', id: 'youtube_VIDEO_ID' });
            });

            it('should identify www.youtu.be/VIDEO_ID in 100ms', function() {
                window.addEventListener.yield({ data: { msg: 'load', url: 'https://www.youtu.be/VIDEO_ID' } });
                sandbox.clock.tick(100);

                expect($scope.entry).to.have.deep.property('content.type', 'youtube-video');
                expect($scope.entry).to.have.deep.property('content.id',   'VIDEO_ID');
                expect($scope.entry.discussions).to.contain({ type: 'youtube-comments', id: 'VIDEO_ID' });
                expect($scope.entry.discussions).to.contain({ type: 'reddit-comments', id: 'youtube_VIDEO_ID' });
            });
        });

        describe('youtube channel URLs', function() {
            it('should identify www.youtube.com/channel/CHANNEL_ID in 100ms', function() {
                window.addEventListener.yield({ data: { msg: 'load', url: 'https://www.youtube.com/channel/CHANNEL_ID' } });
                sandbox.clock.tick(100);

                expect($scope.entry.accounts).to.be.an('array');
                expect($scope.entry.accounts).to.be.contain({ type: 'youtube-channel', id: 'CHANNEL_ID' });
            });
        });
    });

    describe('on hide', function() {
        it('should empty entry', function() {
            $scope.entry = 'Something';
            $scope.$digest();
            window.addEventListener.yield({ data: { msg: 'hide' } });
            $scope.$digest();

            expect($scope.entry).not.to.exist;
        });
    });
});
