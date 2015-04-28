var chai      = require('chai');
var sinon     = require('sinon');
var sinonChai = require('sinon-chai');
var expect    = chai.expect;
chai.use(sinonChai);

require('./chrome');

var common = require('../app/scripts/common');

describe('common', function() {
    var sandbox = sinon.sandbox.create();

    afterEach(function() {
        sandbox.restore();
    });

    describe('.identify_url', function() {
        var entry;

        describe('youtube video URLs', function() {
            afterEach(function() {
                expect(entry).to.have.deep.property('content.type', 'youtube-video');
                expect(entry).to.have.deep.property('content.id',   'VIDEO_ID');
                expect(entry.discussions).to.contain({ type: 'youtube-comments', id: 'VIDEO_ID' });
                expect(entry.discussions).to.contain({ type: 'reddit-comments', id: 'youtube_VIDEO_ID' });
            });

            it('should identify www.youtube.com/watch?v=VIDEO_ID', function() {
                entry = common.identify_url('https://www.youtube.com/watch?v=VIDEO_ID');
            });

            it('should identify m.youtube.com/watch?v=VIDEO_ID in 100ms', function() {
                entry = common.identify_url('https://m.youtube.com/watch?v=VIDEO_ID');
            });

            it('should identify www.youtube.com/v/VIDEO_ID in 100ms', function() {
                entry = common.identify_url('https://www.youtube.com/v/VIDEO_ID');
            });

            it('should identify www.youtube.com/embed/VIDEO_ID in 100ms', function() {
                entry = common.identify_url('https://www.youtube.com/embed/VIDEO_ID');
            });

            it('should identify www.youtu.be/VIDEO_ID in 100ms', function() {
                entry = common.identify_url('https://www.youtu.be/VIDEO_ID');
            });
        });

        describe('youtube channel URLs', function() {
            afterEach(function() {
                expect(entry.accounts).to.be.an('array');
                expect(entry.accounts).to.be.contain({ type: 'youtube-channel', id: 'CHANNEL_ID' });
            });

            it('should identify www.youtube.com/channel/CHANNEL_ID in 100ms', function() {
                entry = common.identify_url('https://www.youtube.com/channel/CHANNEL_ID');
            });
        });

        describe('reddit user URLs', function() {
            afterEach(function() {
                expect(entry.accounts).to.be.an('array');
                expect(entry.accounts).to.be.contain({ type: 'reddit-user', id: 'USER_ID' });
            });

            it('should identify www.reddit.com/user/USER_ID in 100ms', function() {
                entry = common.identify_url('https://www.reddit.com/user/USER_ID');
            });
        });
    });
});
