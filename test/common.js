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
        var result;

        describe('youtube video URLs', function() {
            afterEach(function() {
                expect(result).to.have.deep.property('type',       'content');
                expect(result).to.have.deep.property('thing.type', 'youtube-video');
                expect(result).to.have.deep.property('thing.id',   'VIDEO_ID');
            });

            it('should identify www.youtube.com/watch?v=VIDEO_ID', function() {
                result = common.identify_url('https://www.youtube.com/watch?v=VIDEO_ID');
            });

            it('should identify m.youtube.com/watch?v=VIDEO_ID in 100ms', function() {
                result = common.identify_url('https://m.youtube.com/watch?v=VIDEO_ID');
            });

            it('should identify www.youtube.com/v/VIDEO_ID in 100ms', function() {
                result = common.identify_url('https://www.youtube.com/v/VIDEO_ID');
            });

            it('should identify www.youtube.com/embed/VIDEO_ID in 100ms', function() {
                result = common.identify_url('https://www.youtube.com/embed/VIDEO_ID');
            });

            it('should identify www.youtu.be/VIDEO_ID in 100ms', function() {
                result = common.identify_url('https://www.youtu.be/VIDEO_ID');
            });
        });

        describe('youtube channel URLs', function() {
            afterEach(function() {
                expect(result).to.have.deep.property('type', 'account');
                expect(result.thing).to.be.an('array');
                expect(result.thing).to.be.contain({ type: 'youtube-channel', id: 'CHANNEL_ID' });
            });

            it('should identify www.youtube.com/channel/CHANNEL_ID in 100ms', function() {
                result = common.identify_url('https://www.youtube.com/channel/CHANNEL_ID');
            });
        });

        describe('reddit user URLs', function() {
            afterEach(function() {
                expect(result).to.have.deep.property('type', 'account');
                expect(result.thing).to.be.an('array');
                expect(result.thing).to.be.contain({ type: 'reddit-user', id: 'USER_ID' });
            });

            it('should identify www.reddit.com/user/USER_ID in 100ms', function() {
                result = common.identify_url('https://www.reddit.com/user/USER_ID');
            });
        });
    });
});
