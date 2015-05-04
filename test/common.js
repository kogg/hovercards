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
            it('should identify www.youtube.com/watch?v=VIDEO_ID', function() {
                result = common.identify_url('https://www.youtube.com/watch?v=VIDEO_ID');

                expect(result).to.have.deep.property('api',  'youtube');
                expect(result).to.have.deep.property('type', 'content');
                expect(result).to.have.deep.property('id',   'VIDEO_ID');
            });

            it('should identify m.youtube.com/watch?v=VIDEO_ID', function() {
                result = common.identify_url('https://m.youtube.com/watch?v=VIDEO_ID');

                expect(result).to.have.deep.property('api',  'youtube');
                expect(result).to.have.deep.property('type', 'content');
                expect(result).to.have.deep.property('id',   'VIDEO_ID');
            });

            it('should identify www.youtube.com/v/VIDEO_ID', function() {
                result = common.identify_url('https://www.youtube.com/v/VIDEO_ID');

                expect(result).to.have.deep.property('api',  'youtube');
                expect(result).to.have.deep.property('type', 'content');
                expect(result).to.have.deep.property('id',   'VIDEO_ID');
            });

            it('should identify www.youtube.com/embed/VIDEO_ID', function() {
                result = common.identify_url('https://www.youtube.com/embed/VIDEO_ID');

                expect(result).to.have.deep.property('api',  'youtube');
                expect(result).to.have.deep.property('type', 'content');
                expect(result).to.have.deep.property('id',   'VIDEO_ID');
            });

            it('should identify www.youtu.be/VIDEO_ID', function() {
                result = common.identify_url('https://www.youtu.be/VIDEO_ID');

                expect(result).to.have.deep.property('api',  'youtube');
                expect(result).to.have.deep.property('type', 'content');
                expect(result).to.have.deep.property('id',   'VIDEO_ID');
            });
        });

        describe('youtube channel URLs', function() {
            it('should identify www.youtube.com/channel/CHANNEL_ID', function() {
                result = common.identify_url('https://www.youtube.com/channel/CHANNEL_ID');

                expect(result).to.have.deep.property('api',  'youtube');
                expect(result).to.have.deep.property('type', 'account');
                expect(result).to.have.deep.property('id',   'CHANNEL_ID');
            });
        });

        describe('reddit comments URLs', function() {
            it('should identify www.reddit.com/r/subreddit/comments/DISCUSSION_ID/', function() {
                result = common.identify_url('https://www.reddit.com/r/subreddit/comments/DISCUSSION_ID/');

                expect(result).to.have.deep.property('api',  'reddit');
                expect(result).to.have.deep.property('type', 'discussion');
                expect(result).to.have.deep.property('id',   'DISCUSSION_ID');
            });

            it('should identify www.reddit.com/r/subreddit/comments/DISCUSSION_ID/discussion_name/', function() {
                result = common.identify_url('https://www.reddit.com/r/subreddit/comments/DISCUSSION_ID/discussion_name/');

                expect(result).to.have.deep.property('api',  'reddit');
                expect(result).to.have.deep.property('type', 'discussion');
                expect(result).to.have.deep.property('id',   'DISCUSSION_ID');
            });
        });

        describe('reddit user URLs', function() {
            it('should identify www.reddit.com/user/USER_ID', function() {
                result = common.identify_url('https://www.reddit.com/user/USER_ID');

                expect(result).to.have.deep.property('api',  'reddit');
                expect(result).to.have.deep.property('type', 'account');
                expect(result).to.have.deep.property('id',   'USER_ID');
            });
        });
    });
});
