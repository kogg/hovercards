/* eslint-disable max-nested-callbacks, no-multi-str */
var chai           = require('chai');
var chaiAsPromised = require('chai-as-promised');
var nock           = require('nock');
var sinon          = require('sinon');
var sinonChai      = require('sinon-chai');
var expect         = chai.expect;
chai.use(chaiAsPromised);
chai.use(sinonChai);

var config = require('../config');

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
				.query({
					key:       'GOOGLE_SERVER_KEY',
					part:      'snippet,statistics',
					id:        'CONTENT_ID',
					quotaUser: 'DEVICE_ID'
				});

			default_video = {
				items: [
					{
						id:      'CONTENT_ID',
						snippet: {
							publishedAt: '2015-04-07T20:11:17.000Z',
							channelId:   'ACCOUNT_ID',
							title:       'NAME',
							description: 'TEXT',
							thumbnails:  {
								default: {
									url: 'image_120_90.jpg'
								},
								medium: {
									url: 'image_320_180.jpg'
								},
								high: {
									url: 'image_480_360.jpg'
								}
							},
							channelTitle: 'ACCOUNT NAME'
						},
						statistics: {
							viewCount:    3000,
							likeCount:    1000,
							dislikeCount: 2000,
							commentCount: 4000
						}
					}
				]
			};
		});

		it('should callback youtube video', function() {
			video_endpoint.reply(200, default_video);

			return expect(youtube.content({ id: 'CONTENT_ID', device_id: 'DEVICE_ID' })).to.eventually.eql({ api: 'youtube', type: 'content', id: 'CONTENT_ID', name: 'NAME', text: 'TEXT', date: 1428437477000, image: { small: 'image_120_90.jpg', medium: 'image_320_180.jpg', large: 'image_480_360.jpg' }, stats: { likes: 1000, dislikes: 2000, views: 3000 }, account: { api: 'youtube', type: 'account', id: 'ACCOUNT_ID', name: 'ACCOUNT NAME' } });
		});

		it('should replace newlines with linebreaks in the text', function() {
			default_video.items[0].snippet.description = 'TE\nXT';
			video_endpoint.reply(200, default_video);

			return expect(youtube.content({ id: 'CONTENT_ID', device_id: 'DEVICE_ID' })).to.eventually.have.property('text', 'TE<br>XT');
		});

		describe('video endpoint', function() {
			it('should 404 on empty result', function() {
				video_endpoint.reply(200, '');

				return expect(youtube.content({ id: 'CONTENT_ID', device_id: 'DEVICE_ID' })).to.be.rejected.and.to.eventually.have.property('status', 404);
			});

			it('should 404 on 404', function() {
				video_endpoint.reply(404, '');

				return expect(youtube.content({ id: 'CONTENT_ID', device_id: 'DEVICE_ID' })).to.be.rejected.and.to.eventually.have.property('status', 404);
			});

			it('should 429 on 429', function() {
				video_endpoint.reply(429, '');

				return expect(youtube.content({ id: 'CONTENT_ID', device_id: 'DEVICE_ID' })).to.be.rejected.and.to.eventually.have.property('status', 429);
			});

			it('should 500 on 4xx', function() {
				video_endpoint.reply(478, '');

				var promise = youtube.content({ id: 'CONTENT_ID', device_id: 'DEVICE_ID' });

				return Promise.all([
					expect(promise).to.be.rejected.and.to.eventually.have.property('status', 500),
					expect(promise).to.be.rejected.and.to.eventually.have.property('original_status', 478)
				]);
			});

			it('should 502 on 5xx', function() {
				video_endpoint.reply(578, '');

				var promise = youtube.content({ id: 'CONTENT_ID', device_id: 'DEVICE_ID' });

				return Promise.all([
					expect(promise).to.be.rejected.and.to.eventually.have.property('status', 502),
					expect(promise).to.be.rejected.and.to.eventually.have.property('original_status', 578)
				]);
			});
		});
	});

	describe('.discussion', function() {
		var comment_threads_endpoint;
		var default_comment_threads;

		beforeEach(function() {
			comment_threads_endpoint = nock('https://www.googleapis.com')
				.get('/youtube/v3/commentThreads')
				.query({ key: 'GOOGLE_SERVER_KEY', part: 'snippet,replies', videoId: 'CONTENT_ID', quotaUser: 'DEVICE_ID', order: 'relevance', maxResults: config.counts.listed });

			default_comment_threads = { items: [{ id: 'COMMENT_ID_1', snippet: { totalReplyCount: 100, topLevelComment: { id: 'COMMENT_ID_1', snippet: { textDisplay: 'TEXT 1', authorDisplayName: 'NAME 1', authorProfileImageUrl: 'image1.jpg', authorChannelId: { value: 'ACCOUNT_ID_1' }, likeCount: 1000, publishedAt: '2015-04-07T20:23:35.000Z' } } }, replies: { comments: [{ id: 'COMMENT_ID_1_1', snippet: { textDisplay: 'TEXT 1_1', authorDisplayName: 'NAME 1_1', authorProfileImageUrl: 'image1_1.jpg', authorChannelId: { value: 'ACCOUNT_ID_1_1' }, likeCount: 1001, publishedAt: '2015-04-07T20:23:35.000Z' } }, { id: 'COMMENT_ID_1_2', snippet: { textDisplay: 'TEXT 1_2', authorDisplayName: 'NAME 1_2', authorProfileImageUrl: 'image1_2.jpg', authorChannelId: { value: 'ACCOUNT_ID_1_2' }, likeCount: 1002, publishedAt: '2015-04-07T20:23:35.000Z' } }] } }, { id: 'COMMENT_ID_2', snippet: { totalReplyCount: 200, topLevelComment: { id: 'COMMENT_ID_2', snippet: { textDisplay: 'TEXT 2', authorDisplayName: 'NAME 2', authorProfileImageUrl: 'image2.jpg', authorChannelId: { value: 'ACCOUNT_ID_2' }, likeCount: 2000, publishedAt: '2015-04-07T20:23:35.000Z' } } }, replies: { comments: [{ id: 'COMMENT_ID_2_1', snippet: { textDisplay: 'TEXT 2_1', authorDisplayName: 'NAME 2_1', authorProfileImageUrl: 'image2_1.jpg', authorChannelId: { value: 'ACCOUNT_ID_2_1' }, likeCount: 2001, publishedAt: '2015-04-07T20:23:35.000Z' } }, { id: 'COMMENT_ID_2_2', snippet: { textDisplay: 'TEXT 2_2', authorDisplayName: 'NAME 2_2', authorProfileImageUrl: 'image2_2.jpg', authorChannelId: { value: 'ACCOUNT_ID_2_2' }, likeCount: 2002, publishedAt: '2015-04-07T20:23:35.000Z' } }] } }] };
		});

		it('should callback youtube comments', function() {
			comment_threads_endpoint.reply(200, default_comment_threads);

			return expect(youtube.discussion({ id: 'CONTENT_ID', device_id: 'DEVICE_ID' })).to.eventually.eql({ api: 'youtube', type: 'discussion', id: 'CONTENT_ID', comments: [{ api: 'youtube', type: 'comment', id: 'COMMENT_ID_1', text: 'TEXT 1', date: 1428438215000, stats: { likes: 1000, replies: 100 }, account: { api: 'youtube', type: 'account', id: 'ACCOUNT_ID_1', name: 'NAME 1', image: { small: 'image1.jpg' } }, replies: [{ api: 'youtube', type: 'comment', id: 'COMMENT_ID_1_2', text: 'TEXT 1_2', date: 1428438215000, stats: { likes: 1002 }, account: { api: 'youtube', type: 'account', id: 'ACCOUNT_ID_1_2', name: 'NAME 1_2', image: { small: 'image1_2.jpg' } } }, { api: 'youtube', type: 'comment', id: 'COMMENT_ID_1_1', text: 'TEXT 1_1', date: 1428438215000, stats: { likes: 1001 }, account: { api: 'youtube', type: 'account', id: 'ACCOUNT_ID_1_1', name: 'NAME 1_1', image: { small: 'image1_1.jpg' } } }] }, { api: 'youtube', type: 'comment', id: 'COMMENT_ID_2', text: 'TEXT 2', date: 1428438215000, stats: { likes: 2000, replies: 200 }, account: { api: 'youtube', type: 'account', id: 'ACCOUNT_ID_2', name: 'NAME 2', image: { small: 'image2.jpg' } }, replies: [{ api: 'youtube', type: 'comment', id: 'COMMENT_ID_2_2', text: 'TEXT 2_2', date: 1428438215000, stats: { likes: 2002 }, account: { api: 'youtube', type: 'account', id: 'ACCOUNT_ID_2_2', name: 'NAME 2_2', image: { small: 'image2_2.jpg' } } }, { api: 'youtube', type: 'comment', id: 'COMMENT_ID_2_1', text: 'TEXT 2_1', date: 1428438215000, stats: { likes: 2001 }, account: { api: 'youtube', type: 'account', id: 'ACCOUNT_ID_2_1', name: 'NAME 2_1', image: { small: 'image2_1.jpg' } } }] }] });
		});

		describe('video endpoint', function() {
			it('should 403 on 403', function() {
				comment_threads_endpoint.reply(403, '');

				return expect(youtube.discussion({ id: 'CONTENT_ID', device_id: 'DEVICE_ID' })).to.be.rejected.and.to.eventually.have.property('status', 403);
			});

			it('should 404 on 404', function() {
				comment_threads_endpoint.reply(404, '');

				return expect(youtube.discussion({ id: 'CONTENT_ID', device_id: 'DEVICE_ID' })).to.be.rejected.and.to.eventually.have.property('status', 404);
			});

			it('should 429 on 429', function() {
				comment_threads_endpoint.reply(429, '');

				return expect(youtube.discussion({ id: 'CONTENT_ID', device_id: 'DEVICE_ID' })).to.be.rejected.and.to.eventually.have.property('status', 429);
			});

			it('should 500 on 4xx', function() {
				comment_threads_endpoint.reply(478, '');

				var promise = youtube.discussion({ id: 'CONTENT_ID', device_id: 'DEVICE_ID' });

				return Promise.all([
					expect(promise).to.be.rejected.and.to.eventually.have.property('status', 500),
					expect(promise).to.be.rejected.and.to.eventually.have.property('original_status', 478)
				]);
			});

			it('should 502 on 5xx', function() {
				comment_threads_endpoint.reply(578, '');

				var promise = youtube.discussion({ id: 'CONTENT_ID', device_id: 'DEVICE_ID' });

				return Promise.all([
					expect(promise).to.be.rejected.and.to.eventually.have.property('status', 502),
					expect(promise).to.be.rejected.and.to.eventually.have.property('original_status', 578)
				]);
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
				.query({ key: 'GOOGLE_SERVER_KEY', part: 'snippet,statistics,brandingSettings,contentDetails', id: 'ACCOUNT_ID', quotaUser: 'DEVICE_ID', maxResults: 1 });

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
			default_channel = { items: [{ id: 'ACCOUNT_ID', snippet: { title: 'NAME', description: 'TEXT', thumbnails: { default: { url: 'image_80_80.jpg' }, medium: { url: 'image_240_240.jpg' }, high: { url: 'image_800_800.jpg' } } }, statistics: { viewCount: 6000, subscriberCount: 5000, hiddenSubscriberCount: false, videoCount: 4000 }, brandingSettings: { image: { bannerImageUrl: 'banner_1060_175.jpg', bannerMobileImageUrl: 'banner_640_175.jpg', bannerTabletLowImageUrl: 'banner_1138_188.jpg', bannerTabletImageUrl: 'banner_1707_283.jpg', bannerTabletHdImageUrl: 'banner_2276_377.jpg', bannerTabletExtraHdImageUrl: 'banner_2560_424.jpg', bannerMobileLowImageUrl: 'banner_320_88.jpg', bannerMobileMediumHdImageUrl: 'banner_960_263.jpg', bannerMobileHdImageUrl: 'banner_1280_360.jpg', bannerMobileExtraHdImageUrl: 'banner_1440_395.jpg', bannerTvImageUrl: 'banner_2120_1192.jpg', bannerTvLowImageUrl: 'banner_854_480.jpg', bannerTvMediumImageUrl: 'banner_1280_720.jpg', bannerTvHighImageUrl: 'banner_1920_1080.jpg' } }, contentDetails: {} }] };
		});

		afterEach(function() {
			sandbox.restore();
		});

		it('should callback youtube channel', function() {
			about_page_endpoint.reply(200, default_about_page);
			channel_endpoint.reply(200, default_channel);

			return expect(youtube.account({ id: 'ACCOUNT_ID', device_id: 'DEVICE_ID' })).to.eventually.eql({ api: 'youtube', type: 'account', id: 'ACCOUNT_ID', name: 'NAME', text: 'TEXT', image: { small: 'image_80_80.jpg', medium: 'image_240_240.jpg', large: 'image_800_800.jpg' }, banner: 'banner_960_263.jpg', stats: { content: 4000, followers: 5000, views: 6000 } });
		});

		it('should callback youtube channel for legacy usernames', function() {
			nock('https://www.youtube.com')
				.get('/user/ACCOUNT_USERNAME/about')
				.reply(200, default_about_page);
			channel_endpoint.reply(200, default_channel);
			nock('https://www.googleapis.com')
				.get('/youtube/v3/channels')
				.query({ key: 'GOOGLE_SERVER_KEY', part: 'id', forUsername: 'ACCOUNT_USERNAME', quotaUser: 'DEVICE_ID', maxResults: 1 })
				.reply(200, { items: [{ id: 'ACCOUNT_ID' }] });

			urls.print.withArgs({ api: 'youtube', type: 'account', id: 'ACCOUNT_USERNAME', as: 'legacy_username' }).returns('https://www.youtube.com/user/ACCOUNT_USERNAME');

			return expect(youtube.account({ id: 'ACCOUNT_USERNAME', device_id: 'DEVICE_ID', as: 'legacy_username' })).to.eventually.eql({ api: 'youtube', type: 'account', id: 'ACCOUNT_ID', name: 'NAME', text: 'TEXT', image: { small: 'image_80_80.jpg', medium: 'image_240_240.jpg', large: 'image_800_800.jpg' }, banner: 'banner_960_263.jpg', stats: { content: 4000, followers: 5000, views: 6000 } });
		});

		it('should callback youtube channel for custom urls', function() {
			about_page_custom_url_endpoint.reply(200, default_about_page);
			channel_endpoint.reply(200, default_channel);

			urls.print.withArgs({ api: 'youtube', type: 'account', id: 'CUSTOM_NAME' }).returns('https://www.youtube.com/channel/CUSTOM_NAME');

			return expect(youtube.account({ id: 'CUSTOM_NAME', device_id: 'DEVICE_ID', as: 'custom_url' })).to.eventually.eql({ api: 'youtube', type: 'account', id: 'ACCOUNT_ID', name: 'NAME', text: 'TEXT', image: { small: 'image_80_80.jpg', medium: 'image_240_240.jpg', large: 'image_800_800.jpg' }, banner: 'banner_960_263.jpg', stats: { content: 4000, followers: 5000, views: 6000 } });
		});

		it('should reference accounts in text', function() {
			about_page_endpoint.reply(200, default_about_page);
			default_channel.items[0].snippet.description = 'https://www.wenoknow.com https://www.hovercards.com';
			urls.parse.withArgs('https://www.hovercards.com').returns({ api: 'some_api', type: 'account', id: 'ACCOUNT_ID_2' });
			channel_endpoint.reply(200, default_channel);

			urls.parse.withArgs('https://www.wenoknow.com').returns({ api: 'some_api', type: 'account', id: 'ACCOUNT_ID_1' });

			var promise = youtube.account({ id: 'ACCOUNT_ID', device_id: 'DEVICE_ID' });

			return Promise.all([
				expect(promise).to.eventually.have.property('accounts').that.contains({ api: 'some_api', type: 'account', id: 'ACCOUNT_ID_1' }),
				expect(promise).to.eventually.have.property('accounts').that.contains({ api: 'some_api', type: 'account', id: 'ACCOUNT_ID_2' })
			]);
		});

		it('should reference accounts in about page', function() {
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

			var promise = youtube.account({ id: 'ACCOUNT_ID', device_id: 'DEVICE_ID' });

			return Promise.all([
				expect(promise).to.eventually.have.property('accounts').that.contains({ api: 'some_api', type: 'account', id: 'ACCOUNT_ID_1' }),
				expect(promise).to.eventually.have.property('accounts').that.contains({ api: 'some_api', type: 'account', id: 'ACCOUNT_ID_2' })
			]);
		});

		it('should replace newlines in the text with linebreaks', function() {
			about_page_endpoint.reply(200, default_about_page);
			default_channel.items[0].snippet.description = 'TE\nXT';
			channel_endpoint.reply(200, default_channel);

			return expect(youtube.account({ id: 'ACCOUNT_ID', device_id: 'DEVICE_ID' })).to.eventually.have.property('text', 'TE<br>XT');
		});

		describe('about page', function() {
			beforeEach(function() {
				channel_endpoint.reply(200, default_channel);
			});

			it('should 404 on empty result', function() {
				about_page_endpoint.reply(200, '');

				return expect(youtube.account({ id: 'ACCOUNT_ID', device_id: 'DEVICE_ID' })).to.be.rejected.and.to.eventually.have.property('status', 404);
			});

			it('should 404 on 404', function() {
				about_page_endpoint.reply(404, '');

				return expect(youtube.account({ id: 'ACCOUNT_ID', device_id: 'DEVICE_ID' })).to.be.rejected.and.to.eventually.have.property('status', 404);
			});

			it('should 429 on 429', function() {
				about_page_endpoint.reply(429, '');

				return expect(youtube.account({ id: 'ACCOUNT_ID', device_id: 'DEVICE_ID' })).to.be.rejected.and.to.eventually.have.property('status', 429);
			});

			it('should 500 on 4xx', function() {
				about_page_endpoint.reply(478, '');

				var promise = youtube.account({ id: 'ACCOUNT_ID', device_id: 'DEVICE_ID' });

				return Promise.all([
					expect(promise).to.be.rejected.and.to.eventually.have.property('status', 500),
					expect(promise).to.be.rejected.and.to.eventually.have.property('original_status', 478)
				]);
			});

			it('should 502 on 5xx', function() {
				about_page_endpoint.reply(578, '');

				var promise = youtube.account({ id: 'ACCOUNT_ID', device_id: 'DEVICE_ID' });

				return Promise.all([
					expect(promise).to.be.rejected.and.to.eventually.have.property('status', 502),
					expect(promise).to.be.rejected.and.to.eventually.have.property('original_status', 578)
				]);
			});
		});

		describe('channel endpoint', function() {
			beforeEach(function() {
				about_page_endpoint.reply(200, default_about_page);
			});

			it('should 404 on empty result', function() {
				channel_endpoint.reply(200, { items: [] });

				return expect(youtube.account({ id: 'ACCOUNT_ID', device_id: 'DEVICE_ID' })).to.be.rejected.and.to.eventually.have.property('status', 404);
			});

			it('should 404 on 404', function() {
				channel_endpoint.reply(404, '');

				return expect(youtube.account({ id: 'ACCOUNT_ID', device_id: 'DEVICE_ID' })).to.be.rejected.and.to.eventually.have.property('status', 404);
			});

			it('should 429 on 429', function() {
				channel_endpoint.reply(429, '');

				return expect(youtube.account({ id: 'ACCOUNT_ID', device_id: 'DEVICE_ID' })).to.be.rejected.and.to.eventually.have.property('status', 429);
			});

			it('should 500 on 4xx', function() {
				channel_endpoint.reply(478, '');

				var promise = youtube.account({ id: 'ACCOUNT_ID', device_id: 'DEVICE_ID' });

				return Promise.all([
					expect(promise).to.be.rejected.and.to.eventually.have.property('status', 500),
					expect(promise).to.be.rejected.and.to.eventually.have.property('original_status', 478)
				]);
			});

			it('should 502 on 5xx', function() {
				channel_endpoint.reply(578, '');

				var promise = youtube.account({ id: 'ACCOUNT_ID', device_id: 'DEVICE_ID' });

				return Promise.all([
					expect(promise).to.be.rejected.and.to.eventually.have.property('status', 502),
					expect(promise).to.be.rejected.and.to.eventually.have.property('original_status', 578)
				]);
			});
		});
	});
});
