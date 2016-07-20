var config    = require('../config');
var chai      = require('chai');
var nock      = require('nock');
var sinon     = require('sinon');
var sinonChai = require('sinon-chai');
var expect    = chai.expect;
chai.use(sinonChai);

describe('youtube', function() {
	var youtube;

	/*
	before(function() {
		nock.recorder.rec();
	});
	*/

	beforeEach(function() {
		youtube = require('.')({ key: 'GOOGLE_SERVER_KEY' });
	});

	afterEach(function() {
		nock.cleanAll();
	});

	describe('.content', function() {
		var video_endpoint;
		var default_video;

		beforeEach(function() {
			video_endpoint = nock('https://www.googleapis.com')
				.get('/youtube/v3/videos')
				.query({ key:       'GOOGLE_SERVER_KEY',
				         part:      'snippet,statistics',
				         id:        'CONTENT_ID',
				         quotaUser: 'DEVICE_ID' });

			default_video = { items: [{ id:         'CONTENT_ID',
			                            snippet:    { publishedAt:  '2015-04-07T20:11:17.000Z',
			                                          channelId:    'ACCOUNT_ID',
			                                          title:        'NAME',
			                                          description:  'TEXT',
			                                          thumbnails:   { default: { url: 'image_120_90.jpg' },
			                                                          medium:  { url: 'image_320_180.jpg' },
			                                                          high:    { url: 'image_480_360.jpg' } },
			                                          channelTitle: 'ACCOUNT NAME' },
			                            statistics: { viewCount:    3000,
			                                          likeCount:    1000,
			                                          dislikeCount: 2000,
			                                          commentCount: 4000 } }] };
		});

		it('should callback youtube video', function(done) {
			video_endpoint.reply(200, default_video);

			youtube.content({ id: 'CONTENT_ID', device_id: 'DEVICE_ID' }, function(err, content) {
				expect(err).not.to.be.ok;
				expect(content).to.eql({ api:     'youtube',
				                         type:    'content',
				                         id:      'CONTENT_ID',
				                         name:    'NAME',
				                         text:    'TEXT',
				                         date:    1428437477000,
				                         image:   { small:  'image_120_90.jpg',
				                                    medium: 'image_320_180.jpg',
				                                    large:  'image_480_360.jpg' },
				                         stats:   { likes:    1000,
				                                    dislikes: 2000,
				                                    views:    3000 },
				                         account: { api:     'youtube',
				                                    type:    'account',
				                                    id:      'ACCOUNT_ID',
				                                    name:    'ACCOUNT NAME' } });
				done();
			});
		});

		it('should replace newlines with linebreaks in the text', function(done) {
			default_video.items[0].snippet.description = 'TE\nXT';
			video_endpoint.reply(200, default_video);

			youtube.content({ id: 'CONTENT_ID', device_id: 'DEVICE_ID' }, function(err, content) {
				expect(err).not.to.be.ok;
				expect(content).to.have.property('text', 'TE<br>XT');
				done();
			});
		});

		describe('usage', function() {
			it('should report', function(done) {
				video_endpoint.reply(200, default_video);

				youtube.content({ id: 'CONTENT_ID', device_id: 'DEVICE_ID' }, function(err, content, usage) {
					expect(usage).to.have.property('youtube-quota', 5);
					done();
				});
			});
		});

		describe('video endpoint', function() {
			it('should 404 on empty result', function(done) {
				video_endpoint.reply(200, '');

				youtube.content({ id: 'CONTENT_ID', device_id: 'DEVICE_ID' }, function(err) {
					expect(err).to.eql({ message: 'Youtube Video', status: 404 });
					done();
				});
			});

			it('should 404 on 404', function(done) {
				video_endpoint.reply(404, '');

				youtube.content({ id: 'CONTENT_ID', device_id: 'DEVICE_ID' }, function(err) {
					expect(err).to.eql({ message: 'Youtube Video', status: 404 });
					done();
				});
			});

			it('should 429 on 429', function(done) {
				video_endpoint.reply(429, '');

				youtube.content({ id: 'CONTENT_ID', device_id: 'DEVICE_ID' }, function(err) {
					expect(err).to.eql({ message: 'Youtube Video', status: 429 });
					done();
				});
			});

			it('should 500 on 4xx', function(done) {
				video_endpoint.reply(478, '');

				youtube.content({ id: 'CONTENT_ID', device_id: 'DEVICE_ID' }, function(err) {
					expect(err).to.eql({ message: 'Youtube Video', status: 500, original_status: 478 });
					done();
				});
			});

			it('should 502 on 5xx', function(done) {
				video_endpoint.reply(578, '');

				youtube.content({ id: 'CONTENT_ID', device_id: 'DEVICE_ID' }, function(err) {
					expect(err).to.eql({ message: 'Youtube Video', status: 502, original_status: 578 });
					done();
				});
			});
		});
	});

	describe('.discussion', function() {
		var comment_threads_endpoint;
		var default_comment_threads;

		beforeEach(function() {
			comment_threads_endpoint = nock('https://www.googleapis.com')
				.get('/youtube/v3/commentThreads')
				.query({ key:        'GOOGLE_SERVER_KEY',
				         part:       'snippet,replies',
				         videoId:    'CONTENT_ID',
				         quotaUser:  'DEVICE_ID',
				         order:      'relevance',
				         maxResults: config.counts.listed });

			default_comment_threads = { items: [{ id:      'COMMENT_ID_1',
			                                      snippet: { totalReplyCount: 100,
			                                                 topLevelComment: { id:      'COMMENT_ID_1',
			                                                                    snippet: { textDisplay:           'TEXT 1',
			                                                                               authorDisplayName:     'NAME 1',
			                                                                               authorProfileImageUrl: 'image1.jpg',
			                                                                               authorChannelId:       { value: 'ACCOUNT_ID_1' },
			                                                                               likeCount:             1000,
			                                                                               publishedAt:           '2015-04-07T20:23:35.000Z' } } },
			                                      replies: { comments: [{ id:      'COMMENT_ID_1_1',
			                                                              snippet: { textDisplay:           'TEXT 1_1',
			                                                                         authorDisplayName:     'NAME 1_1',
			                                                                         authorProfileImageUrl: 'image1_1.jpg',
			                                                                         authorChannelId:       { value: 'ACCOUNT_ID_1_1' },
			                                                                         likeCount:             1001,
			                                                                         publishedAt:           '2015-04-07T20:23:35.000Z' } },
			                                                            { id:      'COMMENT_ID_1_2',
			                                                              snippet: { textDisplay:           'TEXT 1_2',
			                                                                         authorDisplayName:     'NAME 1_2',
			                                                                         authorProfileImageUrl: 'image1_2.jpg',
			                                                                         authorChannelId:       { value: 'ACCOUNT_ID_1_2' },
			                                                                         likeCount:             1002,
			                                                                         publishedAt:           '2015-04-07T20:23:35.000Z' } }] } },
			                                    { id:      'COMMENT_ID_2',
			                                      snippet: { totalReplyCount: 200,
			                                                 topLevelComment: { id:      'COMMENT_ID_2',
			                                                                    snippet: { textDisplay:           'TEXT 2',
			                                                                               authorDisplayName:     'NAME 2',
			                                                                               authorProfileImageUrl: 'image2.jpg',
			                                                                               authorChannelId:       { value: 'ACCOUNT_ID_2' },
			                                                                               likeCount:             2000,
			                                                                               publishedAt:           '2015-04-07T20:23:35.000Z' } } },
			                                      replies: { comments: [{ id:      'COMMENT_ID_2_1',
			                                                              snippet: { textDisplay:           'TEXT 2_1',
			                                                                         authorDisplayName:     'NAME 2_1',
			                                                                         authorProfileImageUrl: 'image2_1.jpg',
			                                                                         authorChannelId:       { value: 'ACCOUNT_ID_2_1' },
			                                                                         likeCount:             2001,
			                                                                         publishedAt:           '2015-04-07T20:23:35.000Z' } },
			                                                            { id:      'COMMENT_ID_2_2',
			                                                              snippet: { textDisplay:           'TEXT 2_2',
			                                                                         authorDisplayName:     'NAME 2_2',
			                                                                         authorProfileImageUrl: 'image2_2.jpg',
			                                                                         authorChannelId:       { value: 'ACCOUNT_ID_2_2' },
			                                                                         likeCount:             2002,
			                                                                         publishedAt:           '2015-04-07T20:23:35.000Z' } }] } }] };
		});

		it('should callback youtube comments', function(done) {
			comment_threads_endpoint.reply(200, default_comment_threads);

			youtube.discussion({ id: 'CONTENT_ID', device_id: 'DEVICE_ID' }, function(err, discussion) {
				expect(err).not.to.be.ok;
				expect(discussion).to.eql({ api:      'youtube',
				                            type:     'discussion',
				                            id:       'CONTENT_ID',
				                            comments: [{ api:     'youtube',
				                                         type:    'comment',
				                                         id:      'COMMENT_ID_1',
				                                         text:    'TEXT 1',
				                                         date:    1428438215000,
				                                         stats:   { likes:   1000,
				                                                    replies: 100 },
				                                         account: { api:   'youtube',
				                                                    type:  'account',
				                                                    id:    'ACCOUNT_ID_1',
				                                                    name:  'NAME 1',
				                                                    image: { small: 'image1.jpg' } },
				                                         replies: [{ api:     'youtube',
				                                                     type:    'comment',
				                                                     id:      'COMMENT_ID_1_2',
				                                                     text:    'TEXT 1_2',
				                                                     date:    1428438215000,
				                                                     stats:   { likes: 1002 },
				                                                     account: { api:   'youtube',
				                                                                type:  'account',
				                                                                id:    'ACCOUNT_ID_1_2',
				                                                                name:  'NAME 1_2',
				                                                                image: { small: 'image1_2.jpg' } } },
				                                                   { api:     'youtube',
				                                                     type:    'comment',
				                                                     id:      'COMMENT_ID_1_1',
				                                                     text:    'TEXT 1_1',
				                                                     date:    1428438215000,
				                                                     stats:   { likes: 1001 },
				                                                     account: { api:   'youtube',
				                                                                type:  'account',
				                                                                id:    'ACCOUNT_ID_1_1',
				                                                                name:  'NAME 1_1',
				                                                                image: { small: 'image1_1.jpg' } } }] },
				                                       { api:     'youtube',
				                                         type:    'comment',
				                                         id:      'COMMENT_ID_2',
				                                         text:    'TEXT 2',
				                                         date:    1428438215000,
				                                         stats:   { likes:   2000,
				                                                    replies: 200 },
				                                         account: { api:   'youtube',
				                                                    type:  'account',
				                                                    id:    'ACCOUNT_ID_2',
				                                                    name:  'NAME 2',
				                                                    image: { small: 'image2.jpg' } },
				                                         replies: [{ api:     'youtube',
				                                                     type:    'comment',
				                                                     id:      'COMMENT_ID_2_2',
				                                                     text:    'TEXT 2_2',
				                                                     date:    1428438215000,
				                                                     stats:   { likes: 2002 },
				                                                     account: { api:   'youtube',
				                                                                type:  'account',
				                                                                id:    'ACCOUNT_ID_2_2',
				                                                                name:  'NAME 2_2',
				                                                                image: { small: 'image2_2.jpg' } } },
				                                                   { api:     'youtube',
				                                                     type:    'comment',
				                                                     id:      'COMMENT_ID_2_1',
				                                                     text:    'TEXT 2_1',
				                                                     date:    1428438215000,
				                                                     stats:   { likes: 2001 },
				                                                     account: { api:   'youtube',
				                                                                type:  'account',
				                                                                id:    'ACCOUNT_ID_2_1',
				                                                                name:  'NAME 2_1',
				                                                                image: { small: 'image2_1.jpg' } } }] }] });
				done();
			});
		});

		describe('usage', function() {
			it('should report', function(done) {
				comment_threads_endpoint.reply(200, default_comment_threads);

				youtube.discussion({ id: 'CONTENT_ID', device_id: 'DEVICE_ID' }, function(err, discussion, usage) {
					expect(usage).to.have.property('youtube-quota', 5);
					done();
				});
			});
		});

		describe('video endpoint', function() {
			it('should 403 on 403', function(done) {
				comment_threads_endpoint.reply(403, '');

				youtube.discussion({ id: 'CONTENT_ID', device_id: 'DEVICE_ID' }, function(err) {
					expect(err).to.eql({ message: 'Youtube Comment Threads', status: 403 });
					done();
				});
			});

			it('should 404 on 404', function(done) {
				comment_threads_endpoint.reply(404, '');

				youtube.discussion({ id: 'CONTENT_ID', device_id: 'DEVICE_ID' }, function(err) {
					expect(err).to.eql({ message: 'Youtube Comment Threads', status: 404 });
					done();
				});
			});

			it('should 429 on 429', function(done) {
				comment_threads_endpoint.reply(429, '');

				youtube.discussion({ id: 'CONTENT_ID', device_id: 'DEVICE_ID' }, function(err) {
					expect(err).to.eql({ message: 'Youtube Comment Threads', status: 429 });
					done();
				});
			});

			it('should 500 on 4xx', function(done) {
				comment_threads_endpoint.reply(478, '');

				youtube.discussion({ id: 'CONTENT_ID', device_id: 'DEVICE_ID' }, function(err) {
					expect(err).to.eql({ message: 'Youtube Comment Threads', status: 500, original_status: 478 });
					done();
				});
			});

			it('should 502 on 5xx', function(done) {
				comment_threads_endpoint.reply(578, '');

				youtube.discussion({ id: 'CONTENT_ID', device_id: 'DEVICE_ID' }, function(err) {
					expect(err).to.eql({ message: 'Youtube Comment Threads', status: 502, original_status: 578 });
					done();
				});
			});
		});
	});

	describe('.account', function() {
		var sandbox;
		var urls;
		var about_page_endpoint;
		var about_page_custom_url_endpoint;
		var channel_endpoint;
		var default_about_page;
		var default_channel;

		beforeEach(function() {
			about_page_endpoint = nock('https://www.youtube.com')
				.get('/channel/ACCOUNT_ID/about');
			about_page_custom_url_endpoint = nock('https://www.youtube.com')
				.get('/CUSTOM_NAME/about');
			channel_endpoint = nock('https://www.googleapis.com')
				.get('/youtube/v3/channels')
				.query({ key:        'GOOGLE_SERVER_KEY',
				         part:       'snippet,statistics,brandingSettings,contentDetails',
				         id:         'ACCOUNT_ID',
				         quotaUser:  'DEVICE_ID',
				         maxResults: 1 });

			urls = require('../urls');
			sandbox = sinon.sandbox.create();
			sandbox.stub(urls, 'parse');
			sandbox.stub(urls, 'print');
			urls.parse.withArgs('https://www.youtube.com/channel/ACCOUNT_ID').returns({ api: 'youtube', type: 'account', id: 'ACCOUNT_ID' });
			urls.print.withArgs({ api: 'youtube', type: 'account', id: 'ACCOUNT_ID' }).returns('https://www.youtube.com/channel/ACCOUNT_ID');
			urls.print.withArgs({ api: 'youtube', type: 'account', id: 'CUSTOM_NAME', as: 'custom_url' }).returns('https://www.youtube.com/CUSTOM_NAME');

			// jshint multistr:true
			default_about_page = '<html>\
			                          <body>\
			                              <a class="channel-header-profile-image-container spf-link" href="/channel/ACCOUNT_ID">\
			                                  <img class="channel-header-profile-image">\
			                              </a>\
			                          </body>\
			                      </html>';
			// jshint multistr:false
			default_channel = { items: [{ id:               'ACCOUNT_ID',
			                              snippet:          { title:       'NAME',
			                                                  description: 'TEXT',
			                                                  thumbnails:  { default: { url: 'image_80_80.jpg' },
			                                                                 medium:  { url: 'image_240_240.jpg' },
			                                                                 high:    { url: 'image_800_800.jpg' } } },
			                              statistics:       { viewCount:             6000,
			                                                  subscriberCount:       5000,
			                                                  hiddenSubscriberCount: false,
			                                                  videoCount:            4000 },
			                              brandingSettings: { image: { bannerImageUrl:               'banner_1060_175.jpg',
			                                                           bannerMobileImageUrl:         'banner_640_175.jpg',
			                                                           bannerTabletLowImageUrl:      'banner_1138_188.jpg',
			                                                           bannerTabletImageUrl:         'banner_1707_283.jpg',
			                                                           bannerTabletHdImageUrl:       'banner_2276_377.jpg',
			                                                           bannerTabletExtraHdImageUrl:  'banner_2560_424.jpg',
			                                                           bannerMobileLowImageUrl:      'banner_320_88.jpg',
			                                                           bannerMobileMediumHdImageUrl: 'banner_960_263.jpg',
			                                                           bannerMobileHdImageUrl:       'banner_1280_360.jpg',
			                                                           bannerMobileExtraHdImageUrl:  'banner_1440_395.jpg',
			                                                           bannerTvImageUrl:             'banner_2120_1192.jpg',
			                                                           bannerTvLowImageUrl:          'banner_854_480.jpg',
			                                                           bannerTvMediumImageUrl:       'banner_1280_720.jpg',
			                                                           bannerTvHighImageUrl:         'banner_1920_1080.jpg' } },
			                              contentDetails:   {} }] };
		});

		afterEach(function() {
			sandbox.restore();
		});

		it('should callback youtube channel', function(done) {
			about_page_endpoint.reply(200, default_about_page);
			channel_endpoint.reply(200, default_channel);

			youtube.account({ id: 'ACCOUNT_ID', device_id: 'DEVICE_ID' }, function(err, account) {
				expect(err).not.to.be.ok;
				expect(account).to.eql({ api:    'youtube',
				                         type:   'account',
				                         id:     'ACCOUNT_ID',
				                         name:   'NAME',
				                         text:   'TEXT',
				                         image:  { small:  'image_80_80.jpg',
				                                   medium: 'image_240_240.jpg',
				                                   large:  'image_800_800.jpg' },
				                         banner: 'banner_960_263.jpg',
				                         stats:  { content:    4000,
				                                   followers:  5000,
				                                   views:      6000 } });
				done();
			});
		});

		it('should callback youtube channel for legacy usernames', function(done) {
			nock('https://www.youtube.com')
				.get('/user/ACCOUNT_USERNAME/about')
				.reply(200, default_about_page);
			channel_endpoint.reply(200, default_channel);
			nock('https://www.googleapis.com')
				.get('/youtube/v3/channels')
				.query({ key:         'GOOGLE_SERVER_KEY',
				         part:        'id',
				         forUsername: 'ACCOUNT_USERNAME',
				         quotaUser:   'DEVICE_ID',
				         maxResults:  1 })
				.reply(200, { items: [{ id: 'ACCOUNT_ID' }] });

			urls.print.withArgs({ api: 'youtube', type: 'account', id: 'ACCOUNT_USERNAME', as: 'legacy_username' }).returns('https://www.youtube.com/user/ACCOUNT_USERNAME');

			youtube.account({ id: 'ACCOUNT_USERNAME', device_id: 'DEVICE_ID', as: 'legacy_username' }, function(err, account) {
				expect(err).not.to.be.ok;
				expect(account).to.eql({ api:    'youtube',
				                         type:   'account',
				                         id:     'ACCOUNT_ID',
				                         name:   'NAME',
				                         text:   'TEXT',
				                         image:  { small:  'image_80_80.jpg',
				                                   medium: 'image_240_240.jpg',
				                                   large:  'image_800_800.jpg' },
				                         banner: 'banner_960_263.jpg',
				                         stats:  { content:    4000,
				                                   followers:  5000,
				                                   views:      6000 } });
				done();
			});
		});

		it('should callback youtube channel for custom urls', function(done) {
			about_page_custom_url_endpoint.reply(200, default_about_page);
			channel_endpoint.reply(200, default_channel);

			urls.print.withArgs({ api: 'youtube', type: 'account', id: 'CUSTOM_NAME' }).returns('https://www.youtube.com/channel/CUSTOM_NAME');

			youtube.account({ id: 'CUSTOM_NAME', device_id: 'DEVICE_ID', as: 'custom_url' }, function(err, account) {
				expect(err).not.to.be.ok;
				expect(account).to.eql({ api:    'youtube',
				                         type:   'account',
				                         id:     'ACCOUNT_ID',
				                         name:   'NAME',
				                         text:   'TEXT',
				                         image:  { small:  'image_80_80.jpg',
				                                   medium: 'image_240_240.jpg',
				                                   large:  'image_800_800.jpg' },
				                         banner: 'banner_960_263.jpg',
				                         stats:  { content:    4000,
				                                   followers:  5000,
				                                   views:      6000 } });
				done();
			});
		});

		it('should reference accounts in text', function(done) {
			about_page_endpoint.reply(200, default_about_page);
			default_channel.items[0].snippet.description = 'https://www.wenoknow.com https://www.hovercards.com';
			urls.parse.withArgs('https://www.hovercards.com').returns({ api: 'some_api', type: 'account', id: 'ACCOUNT_ID_2' });
			channel_endpoint.reply(200, default_channel);

			urls.parse.withArgs('https://www.wenoknow.com').returns({ api: 'some_api', type: 'account', id: 'ACCOUNT_ID_1' });

			youtube.account({ id: 'ACCOUNT_ID', device_id: 'DEVICE_ID' }, function(err, account) {
				expect(err).not.to.be.ok;
				expect(account.accounts).to.contain({ api: 'some_api', type: 'account', id: 'ACCOUNT_ID_1' });
				expect(account.accounts).to.contain({ api: 'some_api', type: 'account', id: 'ACCOUNT_ID_2' });
				done();
			});
		});

		it('should reference accounts in about page', function(done) {
			// jshint multistr:true
			about_page_endpoint.reply(200, '<html>\
			                                    <body>\
			                                        <a class="channel-header-profile-image-container spf-link" href="/channel/ACCOUNT_ID">\
			                                            <img class="channel-header-profile-image">\
			                                        </a>\
			                                        <div class="about-metadata">\
			                                            <a href="https://www.wenoknow.com" class="about-channel-link">\
			                                                <span class="about-channel-link-text">WeNoKnow</span>\
			                                            </a>\
			                                            <a href="https://www.hovercards.com" class="about-channel-link">\
			                                                <span class="about-channel-link-text">HoverCards</span>\
			                                            </a>\
			                                        </div>\
			                                    </body>\
			                                </html>');
			channel_endpoint.reply(200, default_channel);

			urls.parse.withArgs('https://www.wenoknow.com').returns({ api: 'some_api', type: 'account', id: 'ACCOUNT_ID_1' });
			urls.parse.withArgs('https://www.hovercards.com').returns({ api: 'some_api', type: 'account', id: 'ACCOUNT_ID_2' });

			youtube.account({ id: 'ACCOUNT_ID', device_id: 'DEVICE_ID' }, function(err, account) {
				expect(err).not.to.be.ok;
				expect(account.accounts).to.contain({ api: 'some_api', type: 'account', id: 'ACCOUNT_ID_1' });
				expect(account.accounts).to.contain({ api: 'some_api', type: 'account', id: 'ACCOUNT_ID_2' });
				done();
			});
		});

		it('should replace newlines in the text with linebreaks', function(done) {
			about_page_endpoint.reply(200, default_about_page);
			default_channel.items[0].snippet.description = 'TE\nXT';
			channel_endpoint.reply(200, default_channel);

			youtube.account({ id: 'ACCOUNT_ID', device_id: 'DEVICE_ID' }, function(err, account) {
				expect(err).not.to.be.ok;
				expect(account).to.have.property('text', 'TE<br>XT');
				done();
			});
		});

		describe('usage', function() {
			it('should report', function(done) {
				about_page_endpoint.reply(200, default_about_page);
				channel_endpoint.reply(200, default_channel);

				youtube.account({ id: 'ACCOUNT_ID', device_id: 'DEVICE_ID' }, function(err, account, usage) {
					expect(usage).to.have.property('scanning',      1);
					expect(usage).to.have.property('youtube-quota', 9);
					done();
				});
			});

			it('should not report youtube-quota on scanning failure for custom urls', function(done) {
				about_page_custom_url_endpoint.reply(404, '');
				channel_endpoint.reply(200, default_channel);

				urls.print.withArgs({ api: 'youtube', type: 'account', id: 'CUSTOM_NAME' }).returns('https://www.youtube.com/channel/CUSTOM_NAME');

				youtube.account({ id: 'CUSTOM_NAME', device_id: 'DEVICE_ID', as: 'custom_url' }, function(err, account, usage) {
					expect(usage).to.have.property('scanning',      1);
					expect(usage).to.have.property('youtube-quota', 0);
					done();
				});
			});

			it('should report more quota for legacy usernames', function(done) {
				nock('https://www.youtube.com')
					.get('/user/ACCOUNT_USERNAME/about')
					.reply(200, default_about_page);
				channel_endpoint.reply(200, default_channel);
				nock('https://www.googleapis.com')
					.get('/youtube/v3/channels')
					.query({ key:         'GOOGLE_SERVER_KEY',
					         part:        'id',
					         forUsername: 'ACCOUNT_USERNAME',
					         quotaUser:   'DEVICE_ID',
					         maxResults:  1 })
					.reply(200, { items: [{ id: 'ACCOUNT_ID' }] });

				urls.print.withArgs({ api: 'youtube', type: 'account', id: 'ACCOUNT_USERNAME', as: 'legacy_username' }).returns('https://www.youtube.com/user/ACCOUNT_USERNAME');

				youtube.account({ id: 'ACCOUNT_USERNAME', device_id: 'DEVICE_ID', as: 'legacy_username' }, function(err, account, usage) {
					expect(usage).to.have.property('scanning',      1);
					expect(usage).to.have.property('youtube-quota', 10);
					done();
				});
			});
		});

		describe('about page', function() {
			beforeEach(function() {
				channel_endpoint.reply(200, default_channel);
			});

			it('should 404 on empty result', function(done) {
				about_page_endpoint.reply(200, '');

				youtube.account({ id: 'ACCOUNT_ID', device_id: 'DEVICE_ID' }, function(err) {
					expect(err).to.eql({ message: 'Youtube About Page', status: 404 });
					done();
				});
			});

			it('should 404 on 404', function(done) {
				about_page_endpoint.reply(404, '');

				youtube.account({ id: 'ACCOUNT_ID', device_id: 'DEVICE_ID' }, function(err) {
					expect(err).to.eql({ message: 'Youtube About Page', status: 404 });
					done();
				});
			});

			it('should 429 on 429', function(done) {
				about_page_endpoint.reply(429, '');

				youtube.account({ id: 'ACCOUNT_ID', device_id: 'DEVICE_ID' }, function(err) {
					expect(err).to.eql({ message: 'Youtube About Page', status: 429 });
					done();
				});
			});

			it('should 500 on 4xx', function(done) {
				about_page_endpoint.reply(478, '');

				youtube.account({ id: 'ACCOUNT_ID', device_id: 'DEVICE_ID' }, function(err) {
					expect(err).to.eql({ message: 'Youtube About Page', status: 500, original_status: 478 });
					done();
				});
			});

			it('should 502 on 5xx', function(done) {
				about_page_endpoint.reply(578, '');

				youtube.account({ id: 'ACCOUNT_ID', device_id: 'DEVICE_ID' }, function(err) {
					expect(err).to.eql({ message: 'Youtube About Page', status: 502, original_status: 578 });
					done();
				});
			});
		});

		describe('channel endpoint', function() {
			beforeEach(function() {
				about_page_endpoint.reply(200, default_about_page);
			});

			it('should 404 on empty result', function(done) {
				channel_endpoint.reply(200, { items: [] });

				youtube.account({ id: 'ACCOUNT_ID', device_id: 'DEVICE_ID' }, function(err) {
					expect(err).to.eql({ message: 'Youtube Channel', status: 404 });
					done();
				});
			});

			it('should 404 on 404', function(done) {
				channel_endpoint.reply(404, '');

				youtube.account({ id: 'ACCOUNT_ID', device_id: 'DEVICE_ID' }, function(err) {
					expect(err).to.eql({ message: 'Youtube Channel', status: 404 });
					done();
				});
			});

			it('should 429 on 429', function(done) {
				channel_endpoint.reply(429, '');

				youtube.account({ id: 'ACCOUNT_ID', device_id: 'DEVICE_ID' }, function(err) {
					expect(err).to.eql({ message: 'Youtube Channel', status: 429 });
					done();
				});
			});

			it('should 500 on 4xx', function(done) {
				channel_endpoint.reply(478, '');

				youtube.account({ id: 'ACCOUNT_ID', device_id: 'DEVICE_ID' }, function(err) {
					expect(err).to.eql({ message: 'Youtube Channel', status: 500, original_status: 478 });
					done();
				});
			});

			it('should 502 on 5xx', function(done) {
				channel_endpoint.reply(578, '');

				youtube.account({ id: 'ACCOUNT_ID', device_id: 'DEVICE_ID' }, function(err) {
					expect(err).to.eql({ message: 'Youtube Channel', status: 502, original_status: 578 });
					done();
				});
			});
		});
	});

	describe('.account_content', function() {
		var channel_endpoint;
		var playlist_items_endpoint;
		var default_channel;
		var default_playlist_items;

		beforeEach(function() {
			channel_endpoint = nock('https://www.googleapis.com')
				.get('/youtube/v3/channels')
				.query({ key:        'GOOGLE_SERVER_KEY',
				         part:       'snippet,statistics,brandingSettings,contentDetails',
				         id:         'ACCOUNT_ID',
				         quotaUser:  'DEVICE_ID',
				         maxResults: 1 });
			playlist_items_endpoint = nock('https://www.googleapis.com')
				.get('/youtube/v3/playlistItems')
				.query({ key:        'GOOGLE_SERVER_KEY',
				         part:       'snippet',
				         playlistId: 'PLAYLIST_ID',
				         quotaUser:  'DEVICE_ID',
				         maxResults: config.counts.grid });

			default_channel = { items: [{ contentDetails: { relatedPlaylists: { uploads: 'PLAYLIST_ID' } }, snippet: {}, statistics: {}, brandingSettings: {} }] };
			default_playlist_items = { items: [{ id:      'PLAYLIST_CONTENT_ID_1',
			                                     snippet: { publishedAt: '2015-04-07T20:11:17.000Z',
			                                                title:       'TITLE 1',
			                                                thumbnails:  { default: { url: 'image_1_120_90.jpg' },
			                                                               medium:  { url: 'image_1_320_180.jpg' },
			                                                               high:    { url: 'image_1_480_360.jpg' } },
			                                                resourceId:  { videoId: 'CONTENT_ID_1' } } },
			                                   { id:      'PLAYLIST_CONTENT_ID_2',
			                                     snippet: { publishedAt: '2015-04-07T20:11:17.000Z',
			                                                title:       'TITLE 2',
			                                                thumbnails:  { default: { url: 'image_2_120_90.jpg' },
			                                                               medium:  { url: 'image_2_320_180.jpg' },
			                                                               high:    { url: 'image_2_480_360.jpg' } },
			                                                resourceId:  { videoId: 'CONTENT_ID_2' } } }] };
		});

		it('should callback youtube videos', function(done) {
			channel_endpoint.reply(200, default_channel);
			playlist_items_endpoint.reply(200, default_playlist_items);

			youtube.account_content({ id: 'ACCOUNT_ID', device_id: 'DEVICE_ID' }, function(err, account_content) {
				expect(err).not.to.be.ok;
				expect(account_content).to.eql({ api:     'youtube',
				                                 type:    'account_content',
				                                 id:      'ACCOUNT_ID',
				                                 content: [{ api:   'youtube',
				                                             type:  'content',
				                                             id:    'CONTENT_ID_1',
				                                             name:  'TITLE 1',
				                                             date:  1428437477000,
				                                             image: { small:  'image_1_120_90.jpg',
				                                                      medium: 'image_1_320_180.jpg',
				                                                      large:  'image_1_480_360.jpg' } },
				                                           { api:   'youtube',
				                                             type:  'content',
				                                             id:    'CONTENT_ID_2',
				                                             name:  'TITLE 2',
				                                             date:  1428437477000,
				                                             image: { small:  'image_2_120_90.jpg',
				                                                      medium: 'image_2_320_180.jpg',
				                                                      large:  'image_2_480_360.jpg' } }] });
				done();
			});
		});

		describe('usage', function() {
			it('should report', function(done) {
				channel_endpoint.reply(200, default_channel);
				playlist_items_endpoint.reply(200, default_playlist_items);

				youtube.account_content({ id: 'ACCOUNT_ID', device_id: 'DEVICE_ID' }, function(err, account_content, usage) {
					expect(usage).to.have.property('youtube-quota', 12);
					done();
				});
			});

			it('should not report youtube-quota on channel failure for playlist', function(done) {
				channel_endpoint.reply(404, '');
				playlist_items_endpoint.reply(200, default_playlist_items);

				youtube.account_content({ id: 'ACCOUNT_ID', device_id: 'DEVICE_ID' }, function(err, account_content, usage) {
					expect(usage).to.have.property('youtube-quota', 9);
					done();
				});
			});
		});

		describe('channel endpoint', function() {
			beforeEach(function() {
				playlist_items_endpoint.reply(200, default_playlist_items);
			});

			it('should 404 on empty result', function(done) {
				channel_endpoint.reply(200, { items: [] });

				youtube.account_content({ id: 'ACCOUNT_ID', device_id: 'DEVICE_ID' }, function(err) {
					expect(err).to.eql({ message: 'Youtube Channel', status: 404 });
					done();
				});
			});

			it('should 404 on 404', function(done) {
				channel_endpoint.reply(404, '');

				youtube.account_content({ id: 'ACCOUNT_ID', device_id: 'DEVICE_ID' }, function(err) {
					expect(err).to.eql({ message: 'Youtube Channel', status: 404 });
					done();
				});
			});

			it('should 429 on 429', function(done) {
				channel_endpoint.reply(429, '');

				youtube.account_content({ id: 'ACCOUNT_ID', device_id: 'DEVICE_ID' }, function(err) {
					expect(err).to.eql({ message: 'Youtube Channel', status: 429 });
					done();
				});
			});

			it('should 500 on 4xx', function(done) {
				channel_endpoint.reply(478, '');

				youtube.account_content({ id: 'ACCOUNT_ID', device_id: 'DEVICE_ID' }, function(err) {
					expect(err).to.eql({ message: 'Youtube Channel', status: 500, original_status: 478 });
					done();
				});
			});

			it('should 502 on 5xx', function(done) {
				channel_endpoint.reply(578, '');

				youtube.account_content({ id: 'ACCOUNT_ID', device_id: 'DEVICE_ID' }, function(err) {
					expect(err).to.eql({ message: 'Youtube Channel', status: 502, original_status: 578 });
					done();
				});
			});
		});

		describe('playlist items endpoint', function() {
			beforeEach(function() {
				channel_endpoint.reply(200, default_channel);
			});

			it('should 404 on 404', function(done) {
				playlist_items_endpoint.reply(404, '');

				youtube.account_content({ id: 'ACCOUNT_ID', device_id: 'DEVICE_ID' }, function(err) {
					expect(err).to.eql({ message: 'Youtube Playlist Items', status: 404 });
					done();
				});
			});

			it('should 429 on 429', function(done) {
				playlist_items_endpoint.reply(429, '');

				youtube.account_content({ id: 'ACCOUNT_ID', device_id: 'DEVICE_ID' }, function(err) {
					expect(err).to.eql({ message: 'Youtube Playlist Items', status: 429 });
					done();
				});
			});

			it('should 500 on 4xx', function(done) {
				playlist_items_endpoint.reply(478, '');

				youtube.account_content({ id: 'ACCOUNT_ID', device_id: 'DEVICE_ID' }, function(err) {
					expect(err).to.eql({ message: 'Youtube Playlist Items', status: 500, original_status: 478 });
					done();
				});
			});

			it('should 502 on 5xx', function(done) {
				playlist_items_endpoint.reply(578, '');

				youtube.account_content({ id: 'ACCOUNT_ID', device_id: 'DEVICE_ID' }, function(err) {
					expect(err).to.eql({ message: 'Youtube Playlist Items', status: 502, original_status: 578 });
					done();
				});
			});
		});
	});
});

describe('youtube urls', function() {
	var urls;

	beforeEach(function() {
		urls = require('./urls');
	});

	describe('.parse', function() {
		var url;

		beforeEach(function() {
			url = require('url');
		});

		describe('into content', function() {
			it('from youtube.com/watch?v=CONTENT_ID', function() {
				expect(urls.parse(url.parse('https://www.youtube.com/watch?v=CONTENT_ID', true, true)))
					.to.eql({ api: 'youtube', type: 'content', id: 'CONTENT_ID' });
			});

			it('from youtube.com/watch?v=CONTENT_ID&t=12345', function() {
				expect(urls.parse(url.parse('https://www.youtube.com/watch?v=CONTENT_ID&t=12345', true, true)))
					.to.eql({ api: 'youtube', type: 'content', id: 'CONTENT_ID', time_offset: '12345' });
			});

			it('from youtube.com/watch?v=CONTENT_ID?something=stupid', function() {
				expect(urls.parse(url.parse('https://www.youtube.com/watch?v=CONTENT_ID?something=stupid', true, true)))
					.to.eql({ api: 'youtube', type: 'content', id: 'CONTENT_ID' });
			});

			it('from m.youtube.com/watch?v=CONTENT_ID', function() {
				expect(urls.parse(url.parse('https://m.youtube.com/watch?v=CONTENT_ID', true, true)))
					.to.eql({ api: 'youtube', type: 'content', id: 'CONTENT_ID' });
			});

			it('from youtube.com/v/CONTENT_ID', function() {
				expect(urls.parse(url.parse('https://www.youtube.com/v/CONTENT_ID', true, true)))
					.to.eql({ api: 'youtube', type: 'content', id: 'CONTENT_ID' });
			});

			it('from youtube.com/v/CONTENT_ID?start=12345', function() {
				expect(urls.parse(url.parse('https://www.youtube.com/v/CONTENT_ID?start=12345', true, true)))
					.to.eql({ api: 'youtube', type: 'content', id: 'CONTENT_ID', time_offset: '12345' });
			});

			it('from youtube.com/v/CONTENT_ID&fs=1', function() {
				expect(urls.parse(url.parse('https://www.youtube.com/v/CONTENT_ID&fs=1', true, true)))
					.to.eql({ api: 'youtube', type: 'content', id: 'CONTENT_ID' });
			});

			it('from youtube.com/embed/CONTENT_ID', function() {
				expect(urls.parse(url.parse('https://www.youtube.com/embed/CONTENT_ID', true, true)))
					.to.eql({ api: 'youtube', type: 'content', id: 'CONTENT_ID' });
			});

			it('from youtube.com/embed/CONTENT_ID?start=12345', function() {
				expect(urls.parse(url.parse('https://www.youtube.com/embed/CONTENT_ID?start=12345', true, true)))
					.to.eql({ api: 'youtube', type: 'content', id: 'CONTENT_ID', time_offset: '12345' });
			});

			it('from youtu.be/CONTENT_ID', function() {
				expect(urls.parse(url.parse('https://youtu.be/CONTENT_ID', true, true)))
					.to.eql({ api: 'youtube', type: 'content', id: 'CONTENT_ID' });
			});

			it('from youtu.be/CONTENT_ID?t=12345', function() {
				expect(urls.parse(url.parse('https://youtu.be/CONTENT_ID?t=12345', true, true)))
					.to.eql({ api: 'youtube', type: 'content', id: 'CONTENT_ID', time_offset: '12345' });
			});

			it('from youtube.com/attribution_link?a=o1LX8xlWfYg&u=/watch%3Fv%3DCONTENT_ID%26feature%3Dem-subs_digest', function() {
				expect(urls.parse(url.parse('http://www.youtube.com/attribution_link?a=o1LX8xlWfYg&u=/watch%3Fv%3DCONTENT_ID%26feature%3Dem-subs_digest', true, true)))
					.to.eql({ api: 'youtube', type: 'content', id: 'CONTENT_ID' });
			});
		});

		describe('into account', function() {
			it('from youtube.com/channel/ACCOUNT_ID', function() {
				expect(urls.parse(url.parse('https://www.youtube.com/channel/ACCOUNT_ID', true, true)))
					.to.eql({ api: 'youtube', type: 'account', id: 'ACCOUNT_ID' });
			});

			it('from youtube.com/channel/ACCOUNT_ID/*', function() {
				expect(urls.parse(url.parse('https://www.youtube.com/channel/ACCOUNT_ID/videos', true, true)))
					.to.eql({ api: 'youtube', type: 'account', id: 'ACCOUNT_ID' });
			});

			it('from youtube.com/user/ACCOUNT_ID', function() {
				expect(urls.parse(url.parse('https://www.youtube.com/user/ACCOUNT_ID', true, true)))
					.to.eql({ api: 'youtube', type: 'account', id: 'ACCOUNT_ID', as: 'legacy_username' });
			});

			it('from youtube.com/user/ACCOUNT_ID/*', function() {
				expect(urls.parse(url.parse('https://www.youtube.com/user/ACCOUNT_ID/videos', true, true)))
					.to.eql({ api: 'youtube', type: 'account', id: 'ACCOUNT_ID', as: 'legacy_username' });
			});

			it('from youtube.com/ACCOUNT_ID', function() {
				expect(urls.parse(url.parse('https://www.youtube.com/ACCOUNT_ID', true, true)))
					.to.eql({ api: 'youtube', type: 'account', id: 'ACCOUNT_ID', as: 'custom_url' });
			});

			it('from youtube.com/c/ACCOUNT_ID', function() {
				expect(urls.parse(url.parse('https://www.youtube.com/c/ACCOUNT_ID', true, true)))
					.to.eql({ api: 'youtube', type: 'account', id: 'c/ACCOUNT_ID', as: 'custom_url' });
			});

			it('not from youtube.com/account', function() {
				expect(urls.parse(url.parse('https://www.youtube.com/account', true, true))).not.to.be.ok;
			});

			it('not from youtube.com/channels', function() {
				expect(urls.parse(url.parse('https://www.youtube.com/channels', true, true))).not.to.be.ok;
			});

			it('not from youtube.com/dashboard', function() {
				expect(urls.parse(url.parse('https://www.youtube.com/dashboard', true, true))).not.to.be.ok;
			});

			it('not from youtube.com/feed', function() {
				expect(urls.parse(url.parse('https://www.youtube.com/feed', true, true))).not.to.be.ok;
			});

			it('not from youtube.com/feed/subscriptions', function() {
				expect(urls.parse(url.parse('https://www.youtube.com/feed/subscriptions', true, true))).not.to.be.ok;
			});

			it('not from youtube.com/logout', function() {
				expect(urls.parse(url.parse('https://www.youtube.com/logout', true, true))).not.to.be.ok;
			});

			it('not from youtube.com/playlist', function() {
				expect(urls.parse(url.parse('https://www.youtube.com/playlist', true, true))).not.to.be.ok;
			});

			it('not from youtube.com/signin', function() {
				expect(urls.parse(url.parse('https://www.youtube.com/signin', true, true))).not.to.be.ok;
			});

			it('not from youtube.com/subscription_center', function() {
				expect(urls.parse(url.parse('https://www.youtube.com/subscription_center', true, true))).not.to.be.ok;
			});

			it('not from youtube.com/subscription_manager', function() {
				expect(urls.parse(url.parse('https://www.youtube.com/subscription_manager', true, true))).not.to.be.ok;
			});

			it('not from youtube.com/t/terms', function() {
				expect(urls.parse(url.parse('https://www.youtube.com/t/terms', true, true))).not.to.be.ok;
			});

			it('not from youtube.com/testtube', function() {
				expect(urls.parse(url.parse('https://www.youtube.com/testtube', true, true))).not.to.be.ok;
			});

			it('not from youtube.com/upload', function() {
				expect(urls.parse(url.parse('https://www.youtube.com/upload', true, true))).not.to.be.ok;
			});

			it('not from youtube.com/yt/copyright', function() {
				expect(urls.parse(url.parse('https://www.youtube.com/yt/copyright', true, true))).not.to.be.ok;
			});
		});
	});

	describe('.represent', function() {
		it('should represent content', function() {
			var representations = urls.represent({ type: 'content', id: 'CONTENT_ID' });
			expect(representations).to.contain('https://www.youtube.com/watch?v=CONTENT_ID');
			expect(representations).to.contain('https://youtu.be/CONTENT_ID');
		});

		it('should represent content with comment', function() {
			var representations = urls.represent({ type: 'content', id: 'CONTENT_ID' }, { id: 'COMMENT_ID' });
			expect(representations).to.contain('https://www.youtube.com/watch?v=CONTENT_ID&lc=COMMENT_ID');
			expect(representations).to.contain('https://youtu.be/CONTENT_ID?lc=COMMENT_ID');
		});

		it('should represent account', function() {
			expect(urls.represent({ type: 'account', id: 'ACCOUNT_ID' })).to.contain('https://www.youtube.com/channel/ACCOUNT_ID');
		});

		it('should represent legacy_username account', function() {
			expect(urls.represent({ type: 'account', id: 'USER_NAME', as: 'legacy_username' })).to.contain('https://www.youtube.com/user/USER_NAME');
		});

		it('should represent custom_url account', function() {
			expect(urls.represent({ type: 'account', id: 'USER_NAME', as: 'custom_url' })).to.contain('https://www.youtube.com/USER_NAME');
		});
	});
});
