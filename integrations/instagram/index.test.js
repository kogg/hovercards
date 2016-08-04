/* eslint-disable max-nested-callbacks */
var chai           = require('chai');
var chaiAsPromised = require('chai-as-promised');
var nock           = require('nock');
var sinon          = require('sinon');
var sinonChai      = require('sinon-chai');
var expect         = chai.expect;
chai.use(chaiAsPromised);
chai.use(sinonChai);

var config = require('../config');

describe('instagram', function() {
	var instagram;

	/*
	before(function() {
		nock.recorder.rec();
	});
	*/

	beforeEach(function() {
		instagram = require('.')({ key: 'INSTAGRAM_CLIENT_ID', secret: 'INSTAGRAM_CLIENT_SECRET' });
	});

	afterEach(function() {
		nock.cleanAll();
	});

	describe('.content', function() {
		var media_shortcode_endpoint;
		var default_media_shortcode;

		beforeEach(function() {
			media_shortcode_endpoint = nock('https://api.instagram.com')
				.get('/v1/media/shortcode/CONTENT_ID')
				.query({ client_id: 'INSTAGRAM_CLIENT_ID', client_secret: 'INSTAGRAM_CLIENT_SECRET' });

			default_media_shortcode = { meta: { code: 200 }, data: { type: 'image', comments: { data: [{ created_time: '1279341004', text: 'TEXT 1', from: { username: 'ACCOUNT_ID_1', full_name: 'NAME 1', profile_picture: 'image_1_150_150.jpg' } }, { created_time: '1279332030', text: 'TEXT 2', from: { username: 'ACCOUNT_ID_2', full_name: 'NAME 2', profile_picture: 'image_2_150_150.jpg' } }], count: 2000 }, caption: { text: 'TEXT' }, likes: { count: 1000 }, link: 'http://instagr.am/p/CONTENT_ID/', user: { username: 'ACCOUNT_ID', full_name: 'ACCOUNT NAME', profile_picture: 'account_image_150_150.jpg' }, created_time: '1279340983', images: { low_resolution: { url: 'image_306_306.jpg' }, thumbnail: { url: 'image_150_150.jpg' }, standard_resolution: { url: 'image_612_612.jpg' } } } };
		});

		it('should callback instagram media', function() {
			media_shortcode_endpoint.reply(200, default_media_shortcode);

			return expect(instagram.content({ id: 'CONTENT_ID' })).to.eventually.eql({ api: 'instagram', type: 'content', id: 'CONTENT_ID', text: 'TEXT', date: 1279340983000, image: { small: 'image_150_150.jpg', medium: 'image_306_306.jpg', large: 'image_612_612.jpg' }, stats: { likes: 1000, comments: 2000 }, account: { api: 'instagram', type: 'account', id: 'ACCOUNT_ID', name: 'ACCOUNT NAME', image: { medium: 'account_image_150_150.jpg' } }, discussions: [{ api: 'instagram', type: 'discussion', id: 'CONTENT_ID', comments: [{ api: 'instagram', type: 'comment', text: 'TEXT 1', date: 1279341004000, account: { api: 'instagram', type: 'account', id: 'ACCOUNT_ID_1', name: 'NAME 1', image: { medium: 'image_1_150_150.jpg' } } }, { api: 'instagram', type: 'comment', text: 'TEXT 2', date: 1279332030000, account: { api: 'instagram', type: 'account', id: 'ACCOUNT_ID_2', name: 'NAME 2', image: { medium: 'image_2_150_150.jpg' } } }] }] });
		});

		it('should callback instagram video media', function() {
			default_media_shortcode.data.type = 'video';
			default_media_shortcode.data.videos = { standard_resolution: { url: 'video_640_640.mp4' } };
			media_shortcode_endpoint.reply(200, default_media_shortcode);

			return expect(instagram.content({ id: 'CONTENT_ID' })).to.eventually.have.property('video', 'video_640_640.mp4');
		});

		it('should replace hashtags with links in the text', function() {
			default_media_shortcode.data.caption.text = '#thing #thing2';
			default_media_shortcode.data.comments.data[0].text = '#thi';
			default_media_shortcode.data.comments.data[1].text = '#thin';
			media_shortcode_endpoint.reply(200, default_media_shortcode);

			var promise = instagram.content({ id: 'CONTENT_ID' });

			return Promise.all([
				expect(promise).to.eventually.have.property('text', '<a href="https://instagram.com/explore/tags/thing" target="_blank" rel="noopener noreferrer">#thing</a> <a href="https://instagram.com/explore/tags/thing2" target="_blank" rel="noopener noreferrer">#thing2</a>'),
				expect(promise).to.eventually.have.deep.property('discussions[0].comments[0].text', '<a href="https://instagram.com/explore/tags/thi" target="_blank" rel="noopener noreferrer">#thi</a>'),
				expect(promise).to.eventually.have.deep.property('discussions[0].comments[1].text', '<a href="https://instagram.com/explore/tags/thin" target="_blank" rel="noopener noreferrer">#thin</a>')
			]);
		});

		it('should replace accounts with links in the text', function() {
			default_media_shortcode.data.caption.text = '@ACCOUNT_ID_1 @ACCOUNT_ID_2';
			default_media_shortcode.data.comments.data[0].text = '@ACCOUNT_ID_3';
			default_media_shortcode.data.comments.data[1].text = '@ACCOUNT_ID_4';
			media_shortcode_endpoint.reply(200, default_media_shortcode);

			var promise = instagram.content({ id: 'CONTENT_ID' });

			return Promise.all([
				expect(promise).to.eventually.have.property('text', '<a href="https://instagram.com/ACCOUNT_ID_1/" target="_blank" rel="noopener noreferrer">@ACCOUNT_ID_1</a> <a href="https://instagram.com/ACCOUNT_ID_2/" target="_blank" rel="noopener noreferrer">@ACCOUNT_ID_2</a>'),
				expect(promise).to.eventually.have.deep.property('discussions[0].comments[0].text', '<a href="https://instagram.com/ACCOUNT_ID_3/" target="_blank" rel="noopener noreferrer">@ACCOUNT_ID_3</a>'),
				expect(promise).to.eventually.have.deep.property('discussions[0].comments[1].text', '<a href="https://instagram.com/ACCOUNT_ID_4/" target="_blank" rel="noopener noreferrer">@ACCOUNT_ID_4</a>')
			]);
		});

		it('should remove the default image for account', function() {
			default_media_shortcode.data.user.profile_picture = 'https://instagramimages-a.akamaihd.net/profiles/anonymousUser.jpg';
			default_media_shortcode.data.comments.data[0].from.profile_picture = 'https://instagramimages-a.akamaihd.net/profiles/anonymousUser.jpg';
			default_media_shortcode.data.comments.data[1].from.profile_picture = 'https://instagramimages-a.akamaihd.net/profiles/anonymousUser.jpg';
			media_shortcode_endpoint.reply(200, default_media_shortcode);

			var promise = instagram.content({ id: 'CONTENT_ID' });

			return Promise.all([
				expect(promise).to.eventually.not.have.property('account.image'),
				expect(promise).to.eventually.not.have.deep.property('discussions[0].comments[0].account.image'),
				expect(promise).to.eventually.not.have.deep.property('discussions[0].comments[1].account.image')
			]);
		});

		describe('media shortcode endpoint', function() {
			it('should 401 on OAuthAccessTokenException', function() {
				media_shortcode_endpoint.reply(400, { meta: { code: 400, error_type: 'OAuthAccessTokenException', error_message: 'The access_token provided is invalid.' } });

				return expect(instagram.content({ id: 'CONTENT_ID' })).to.be.rejected.and.to.eventually.have.property('status', 401);
			});

			it('should 401 on APINotAllowedError', function() {
				media_shortcode_endpoint.reply(400, { meta: { code: 400, error_type: 'APINotAllowedError', error_message: 'you cannot view this resource' } });

				return expect(instagram.content({ id: 'CONTENT_ID' })).to.be.rejected.and.to.eventually.have.property('status', 401);
			});

			it('should 403 on APINotAllowedError when authorized', function() {
				nock('https://api.instagram.com')
					.get('/v1/media/shortcode/CONTENT_ID')
					.query({ access_token: 'INSTAGRAM_USER' })
					.reply(400, { meta: { code: 400, error_type: 'APINotAllowedError', error_message: 'you cannot view this resource' } });

				return expect(require('.')({ user: 'INSTAGRAM_USER' }).content({ id: 'CONTENT_ID' })).to.be.rejected.and.to.eventually.have.property('status', 403);
			});

			it('should 404 on 404', function() {
				media_shortcode_endpoint.reply(404, { meta: { code: 404, error_type: 'idk', error_message: 'I said IDK' } });

				return expect(instagram.content({ id: 'CONTENT_ID' })).to.be.rejected.and.to.eventually.have.property('status', 404);
			});

			it('should 429 on OAuthRateLimitException', function() {
				media_shortcode_endpoint.reply(429, { meta: { code: 429, error_type: 'OAuthRateLimitException', error_message: 'The maximum number of requests per hour has been exceeded.' } });

				return expect(instagram.content({ id: 'CONTENT_ID' })).to.be.rejected.and.to.eventually.have.property('status', 429);
			});

			it('should 500 on 4xx', function() {
				media_shortcode_endpoint.reply(478, { meta: { code: 478, error_type: 'idk', error_message: 'I said IDK' } });

				var promise = instagram.content({ id: 'CONTENT_ID' });

				return Promise.all([
					expect(promise).to.be.rejected.and.to.eventually.have.property('status', 500),
					expect(promise).to.be.rejected.and.to.eventually.have.property('original_status', 478)
				]);
			});

			it('should 502 on 5xx', function() {
				media_shortcode_endpoint.reply(578, { meta: { code: 578, error_type: 'idk', error_message: 'I said IDK' } });

				var promise = instagram.content({ id: 'CONTENT_ID' });

				return Promise.all([
					expect(promise).to.be.rejected.and.to.eventually.have.property('status', 502),
					expect(promise).to.be.rejected.and.to.eventually.have.property('original_status', 578)
				]);
			});
		});
	});

	describe('.discussion', function() {
		var media_shortcode_endpoint;
		var default_media_shortcode;

		beforeEach(function() {
			media_shortcode_endpoint = nock('https://api.instagram.com')
				.get('/v1/media/shortcode/CONTENT_ID')
				.query({ client_id: 'INSTAGRAM_CLIENT_ID', client_secret: 'INSTAGRAM_CLIENT_SECRET' });

			default_media_shortcode = { meta: { code: 200 }, data: { comments: { data: [{ created_time: '1279341004', text: 'TEXT 1', from: { username: 'ACCOUNT_ID_1', full_name: 'NAME 1', profile_picture: 'image_1_150_150.jpg' } }, { created_time: '1279332030', text: 'TEXT 2', from: { username: 'ACCOUNT_ID_2', full_name: 'NAME 2', profile_picture: 'image_2_150_150.jpg' } }], count: 1000 }, link: 'http://instagr.am/p/CONTENT_ID/' } };
		});

		it('should callback instagram comments', function() {
			media_shortcode_endpoint.reply(200, default_media_shortcode);

			return expect(instagram.discussion({ id: 'CONTENT_ID' })).to.eventually.eql({ api: 'instagram', type: 'discussion', id: 'CONTENT_ID', comments: [{ api: 'instagram', type: 'comment', text: 'TEXT 1', date: 1279341004000, account: { api: 'instagram', type: 'account', id: 'ACCOUNT_ID_1', name: 'NAME 1', image: { medium: 'image_1_150_150.jpg' } } }, { api: 'instagram', type: 'comment', text: 'TEXT 2', date: 1279332030000, account: { api: 'instagram', type: 'account', id: 'ACCOUNT_ID_2', name: 'NAME 2', image: { medium: 'image_2_150_150.jpg' } } }] });
		});

		it('should replace hashtags with links in the text', function() {
			default_media_shortcode.data.comments.data[0].text = '#thi';
			default_media_shortcode.data.comments.data[1].text = '#thin';
			media_shortcode_endpoint.reply(200, default_media_shortcode);

			var promise = instagram.discussion({ id: 'CONTENT_ID' });

			return Promise.all([
				expect(promise).to.eventually.have.deep.property('comments[0].text', '<a href="https://instagram.com/explore/tags/thi" target="_blank" rel="noopener noreferrer">#thi</a>'),
				expect(promise).to.eventually.have.deep.property('comments[1].text', '<a href="https://instagram.com/explore/tags/thin" target="_blank" rel="noopener noreferrer">#thin</a>')
			]);
		});

		it('should replace accounts with links in the text', function() {
			default_media_shortcode.data.comments.data[0].text = '@ACCOUNT_ID_1';
			default_media_shortcode.data.comments.data[1].text = '@ACCOUNT_ID_2';
			media_shortcode_endpoint.reply(200, default_media_shortcode);

			var promise = instagram.discussion({ id: 'CONTENT_ID' });

			return Promise.all([
				expect(promise).to.eventually.have.deep.property('.comments[0].text', '<a href="https://instagram.com/ACCOUNT_ID_1/" target="_blank" rel="noopener noreferrer">@ACCOUNT_ID_1</a>'),
				expect(promise).to.eventually.have.deep.property('.comments[1].text', '<a href="https://instagram.com/ACCOUNT_ID_2/" target="_blank" rel="noopener noreferrer">@ACCOUNT_ID_2</a>')
			]);
		});

		it('should remove the default image for account', function() {
			default_media_shortcode.data.comments.data[0].from.profile_picture = 'https://instagramimages-a.akamaihd.net/profiles/anonymousUser.jpg';
			default_media_shortcode.data.comments.data[1].from.profile_picture = 'https://instagramimages-a.akamaihd.net/profiles/anonymousUser.jpg';
			media_shortcode_endpoint.reply(200, default_media_shortcode);

			var promise = instagram.discussion({ id: 'CONTENT_ID' });

			return Promise.all([
				expect(promise).to.eventually.not.have.property('account.image'),
				expect(promise).to.eventually.not.have.deep.property('discussions[0].comments[0].account.image'),
				expect(promise).to.eventually.not.have.deep.property('discussions[0].comments[1].account.image')
			]);
		});

		describe('media shortcode endpoint', function() {
			it('should 401 on OAuthAccessTokenException', function() {
				media_shortcode_endpoint.reply(400, { meta: { code: 400, error_type: 'OAuthAccessTokenException', error_message: 'The access_token provided is invalid.' } });

				return expect(instagram.discussion({ id: 'CONTENT_ID' })).to.be.rejected.and.to.eventually.have.property('status', 401);
			});

			it('should 401 on APINotAllowedError', function() {
				media_shortcode_endpoint.reply(400, { meta: { code: 400, error_type: 'APINotAllowedError', error_message: 'you cannot view this resource' } });

				return expect(instagram.discussion({ id: 'CONTENT_ID' })).to.be.rejected.and.to.eventually.have.property('status', 401);
			});

			it('should 403 on APINotAllowedError when authorized', function() {
				nock('https://api.instagram.com')
					.get('/v1/media/shortcode/CONTENT_ID')
					.query({ access_token: 'INSTAGRAM_USER' })
					.reply(400, { meta: { code: 400, error_type: 'APINotAllowedError', error_message: 'you cannot view this resource' } });

				return expect(require('.')({ user: 'INSTAGRAM_USER' }).discussion({ id: 'CONTENT_ID' })).to.be.rejected.and.to.eventually.have.property('status', 403);
			});

			it('should 404 on 404', function() {
				media_shortcode_endpoint.reply(404, { meta: { code: 404, error_type: 'idk', error_message: 'I said IDK' } });

				return expect(instagram.discussion({ id: 'CONTENT_ID' })).to.be.rejected.and.to.eventually.have.property('status', 404);
			});

			it('should 429 on OAuthRateLimitException', function() {
				media_shortcode_endpoint.reply(429, { meta: { code: 429, error_type: 'OAuthRateLimitException', error_message: 'The maximum number of requests per hour has been exceeded.' } });

				return expect(instagram.discussion({ id: 'CONTENT_ID' })).to.be.rejected.and.to.eventually.have.property('status', 429);
			});

			it('should 500 on 4xx', function() {
				media_shortcode_endpoint.reply(478, { meta: { code: 478, error_type: 'idk', error_message: 'I said IDK' } });

				var promise = instagram.discussion({ id: 'CONTENT_ID' });

				return Promise.all([
					expect(promise).to.be.rejected.and.to.eventually.have.property('status', 500),
					expect(promise).to.be.rejected.and.to.eventually.have.property('original_status', 478)
				]);
			});

			it('should 502 on 5xx', function() {
				media_shortcode_endpoint.reply(578, { meta: { code: 578, error_type: 'idk', error_message: 'I said IDK' } });

				var promise = instagram.discussion({ id: 'CONTENT_ID' });

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
		var user_endpoint;
		var user_media_recent_endpoint;
		var user_search_endpoint;
		var default_user;
		var default_user_media_recent;
		var default_user_search;

		beforeEach(function() {
			user_endpoint = nock('https://api.instagram.com')
				.get('/v1/users/INSTAGRAM_ACCOUNT_ID')
				.query({ client_id: 'INSTAGRAM_CLIENT_ID', client_secret: 'INSTAGRAM_CLIENT_SECRET' });
			user_media_recent_endpoint = nock('https://api.instagram.com')
				.get('/v1/users/INSTAGRAM_ACCOUNT_ID/media/recent')
				.query({ client_id: 'INSTAGRAM_CLIENT_ID', client_secret: 'INSTAGRAM_CLIENT_SECRET', count: config.counts.grid });
			user_search_endpoint = nock('https://api.instagram.com')
				.get('/v1/users/search')
				.query({ client_id: 'INSTAGRAM_CLIENT_ID', client_secret: 'INSTAGRAM_CLIENT_SECRET', q: 'ACCOUNT_ID' });

			urls = require('../urls');
			sandbox = sinon.sandbox.create();
			sandbox.stub(urls, 'parse');
			sandbox.stub(urls, 'print');
			urls.parse.withArgs('http://instagr.am/p/CONTENT_1/').returns({ api: 'instagram', type: 'content', id: 'CONTENT_1' });
			urls.parse.withArgs('http://instagr.am/p/CONTENT_2/').returns({ api: 'instagram', type: 'content', id: 'CONTENT_2' });
			urls.print.withArgs({ api: 'instagram', type: 'account', id: 'ACCOUNT_ID_1' }).returns('https://instagram.com/ACCOUNT_ID_1/');
			urls.print.withArgs({ api: 'instagram', type: 'account', id: 'ACCOUNT_ID_2' }).returns('https://instagram.com/ACCOUNT_ID_2/');

			default_user = { meta: { code: 200 }, data: { id: 'INSTAGRAM_ACCOUNT_ID', username: 'ACCOUNT_ID', full_name: 'NAME', profile_picture: 'image_150_150.jpg', bio: 'TEXT', website: 'https://www.google.com/', counts: { media: 1000, follows: 3000, followed_by: 2000 } } };
			default_user_media_recent = { meta: { code: 200 }, data: [{ comments: { count: 1002 }, likes: { count: 1001 }, link: 'http://instagr.am/p/CONTENT_1/', created_time: '1296710327', images: { low_resolution: { url: 'image_1_306_306.jpg' }, thumbnail: { url: 'image_1_150_150.jpg' }, standard_resolution: { url: 'image_1_612_612.jpg' } }, type: 'image' }, { videos: { standard_resolution: { url: 'video_640_640.mp4' } }, comments: { count: 2002 }, likes: { count: 2001 }, link: 'http://instagr.am/p/CONTENT_2/', created_time: '1296710327', images: { low_resolution: { url: 'image_2_306_306.jpg' }, thumbnail: { url: 'image_2_150_150.jpg' }, standard_resolution: { url: 'image_2_612_612.jpg' } }, type: 'video' }] };
			default_user_search = { meta: { code: 200 }, data: [{ username: 'ACCOUNT_ID', full_name: 'NAME', profile_picture: 'image_150_150.jpg', id: 'INSTAGRAM_ACCOUNT_ID' }, { username: 'ACCOUNT_ID_2', full_name: 'NAME_2', profile_picture: 'image_2_150_150.jpg', id: 'INSTAGRAM_ACCOUNT_ID_2' }, { username: 'ACCOUNT_ID_3', full_name: 'NAME_3', profile_picture: 'image_3_150_150.jpg', id: 'INSTAGRAM_ACCOUNT_ID_3' }] };
		});

		afterEach(function() {
			sandbox.restore();
		});

		it('should callback instagram user', function() {
			user_endpoint.reply(200, default_user);
			user_media_recent_endpoint.reply(200, default_user_media_recent);
			user_search_endpoint.reply(200, default_user_search);

			return expect(instagram.account({ id: 'ACCOUNT_ID' })).to.eventually.eql({ api: 'instagram', type: 'account', id: 'ACCOUNT_ID', name: 'NAME', text: 'TEXT', image: { medium: 'image_150_150.jpg' }, stats: { content: 1000, followers: 2000, following: 3000 }, content: { api: 'instagram', type: 'account_content', id: 'ACCOUNT_ID', content: [{ api: 'instagram', type: 'content', id: 'CONTENT_1', date: 1296710327000, image: { small: 'image_1_150_150.jpg', medium: 'image_1_306_306.jpg', large: 'image_1_612_612.jpg' }, stats: { likes: 1001, comments: 1002 } }, { api: 'instagram', type: 'content', id: 'CONTENT_2', date: 1296710327000, image: { small: 'image_2_150_150.jpg', medium: 'image_2_306_306.jpg', large: 'image_2_612_612.jpg' }, video: 'video_640_640.mp4', stats: { likes: 2001, comments: 2002 } }] } });
		});

		it('should reference accounts in text', function() {
			default_user.data.bio = 'https://www.wenoknow.com https://www.hovercards.com';
			user_endpoint.reply(200, default_user);
			user_media_recent_endpoint.reply(200, default_user_media_recent);
			user_search_endpoint.reply(200, default_user_search);

			urls.parse.withArgs('https://www.wenoknow.com').returns({ api: 'some_api', type: 'account', id: 'ACCOUNT_ID_1' });
			urls.parse.withArgs('https://www.hovercards.com').returns({ api: 'some_api', type: 'account', id: 'ACCOUNT_ID_2' });

			var promise = instagram.account({ id: 'ACCOUNT_ID' });

			return Promise.all([
				expect(promise).to.eventually.have.property('accounts').that.contains({ api: 'some_api', type: 'account', id: 'ACCOUNT_ID_1' }),
				expect(promise).to.eventually.have.property('accounts').that.contains({ api: 'some_api', type: 'account', id: 'ACCOUNT_ID_2' })
			]);
		});

		it('should reference account in website', function() {
			default_user.data.website = 'https://www.hovercards.com';
			user_endpoint.reply(200, default_user);
			user_media_recent_endpoint.reply(200, default_user_media_recent);
			user_search_endpoint.reply(200, default_user_search);

			urls.parse.withArgs('https://www.hovercards.com').returns({ api: 'some_api', type: 'account', id: 'ACCOUNT_ID_1' });

			return expect(instagram.account({ id: 'ACCOUNT_ID' })).to.eventually.have.property('accounts')
				.that.contains({ api: 'some_api', type: 'account', id: 'ACCOUNT_ID_1' });
		});

		it('should replace hashtags with links in the text', function() {
			default_user.data.bio = '#thing #thing2';
			user_endpoint.reply(200, default_user);
			user_media_recent_endpoint.reply(200, default_user_media_recent);
			user_search_endpoint.reply(200, default_user_search);

			return expect(instagram.account({ id: 'ACCOUNT_ID' })).to.eventually.have.property('text', '<a href="https://instagram.com/explore/tags/thing" target="_blank" rel="noopener noreferrer">#thing</a> <a href="https://instagram.com/explore/tags/thing2" target="_blank" rel="noopener noreferrer">#thing2</a>');
		});

		it('should replace accounts with links in the text', function() {
			default_user.data.bio = '@ACCOUNT_ID_1 @ACCOUNT_ID_2';
			user_endpoint.reply(200, default_user);
			user_media_recent_endpoint.reply(200, default_user_media_recent);
			user_search_endpoint.reply(200, default_user_search);

			return expect(instagram.account({ id: 'ACCOUNT_ID' })).to.eventually.have.property('text', '<a href="https://instagram.com/ACCOUNT_ID_1/" target="_blank" rel="noopener noreferrer">@ACCOUNT_ID_1</a> <a href="https://instagram.com/ACCOUNT_ID_2/" target="_blank" rel="noopener noreferrer">@ACCOUNT_ID_2</a>');
		});

		it('should remove the default image', function() {
			default_user.data.profile_picture = 'https://instagramimages-a.akamaihd.net/profiles/anonymousUser.jpg';
			user_endpoint.reply(200, default_user);
			user_media_recent_endpoint.reply(200, default_user_media_recent);
			user_search_endpoint.reply(200, default_user_search);

			return expect(instagram.account({ id: 'ACCOUNT_ID' })).to.eventually.not.have.property('image');
		});

		describe('user endpoint', function() {
			beforeEach(function() {
				user_search_endpoint.reply(200, default_user_search);
				user_media_recent_endpoint.reply(200, default_user_media_recent);
			});

			it('should 401 on OAuthAccessTokenException', function() {
				user_endpoint.reply(400, { meta: { code: 400, error_type: 'OAuthAccessTokenException', error_message: 'The access_token provided is invalid.' } });

				return expect(instagram.account({ id: 'ACCOUNT_ID' })).to.be.rejected.and.to.eventually.have.property('status', 401);
			});

			it('should 401 on APINotAllowedError', function() {
				user_endpoint.reply(400, { meta: { code: 400, error_type: 'APINotAllowedError', error_message: 'you cannot view this resource' } });

				return expect(instagram.account({ id: 'ACCOUNT_ID' })).to.be.rejected.and.to.eventually.have.property('status', 401);
			});

			it('should 403 on APINotAllowedError when authorized', function() {
				nock('https://api.instagram.com')
					.get('/v1/users/INSTAGRAM_ACCOUNT_ID')
					.query({ access_token: 'INSTAGRAM_USER' })
					.reply(400, { meta: { code: 400, error_type: 'APINotAllowedError', error_message: 'you cannot view this resource' } });
				nock('https://api.instagram.com')
					.get('/v1/users/search')
					.query({ access_token: 'INSTAGRAM_USER', q: 'ACCOUNT_ID' })
					.reply(200, default_user_search);

				return expect(require('.')({ user: 'INSTAGRAM_USER' }).account({ id: 'ACCOUNT_ID' })).to.be.rejected.and.to.eventually.have.property('status', 403);
			});

			it('should 404 on 404', function() {
				user_endpoint.reply(404, { meta: { code: 404, error_type: 'idk', error_message: 'I said IDK' } });

				return expect(instagram.account({ id: 'ACCOUNT_ID' })).to.be.rejected.and.to.eventually.have.property('status', 404);
			});

			it('should 429 on OAuthRateLimitException', function() {
				user_endpoint.reply(429, { meta: { code: 429, error_type: 'OAuthRateLimitException', error_message: 'The maximum number of requests per hour has been exceeded.' } });

				return expect(instagram.account({ id: 'ACCOUNT_ID' })).to.be.rejected.and.to.eventually.have.property('status', 429);
			});

			it('should 500 on 4xx', function() {
				user_endpoint.reply(478, { meta: { code: 478, error_type: 'idk', error_message: 'I said IDK' } });

				var promise = instagram.account({ id: 'ACCOUNT_ID' });

				return Promise.all([
					expect(promise).to.be.rejected.and.to.eventually.have.property('status', 500),
					expect(promise).to.be.rejected.and.to.eventually.have.property('original_status', 478)
				]);
			});

			it('should 502 on 5xx', function() {
				user_endpoint.reply(578, { meta: { code: 578, error_type: 'idk', error_message: 'I said IDK' } });

				var promise = instagram.account({ id: 'ACCOUNT_ID' });

				return Promise.all([
					expect(promise).to.be.rejected.and.to.eventually.have.property('status', 502),
					expect(promise).to.be.rejected.and.to.eventually.have.property('original_status', 578)
				]);
			});
		});

		describe('user media recent endpoint', function() {
			beforeEach(function() {
				user_endpoint.reply(200, default_user);
				user_search_endpoint.reply(200, default_user_search);
			});

			it('should not have content on err', function() {
				user_media_recent_endpoint.reply(404, { meta: { code: 404, error_type: 'idk', error_message: 'I said IDK' } });

				return expect(instagram.account({ id: 'ACCOUNT_ID' })).to.eventually.not.have.property('content');
			});
		});

		describe('user search endpoint', function() {
			beforeEach(function() {
				user_endpoint.reply(200, default_user);
				user_media_recent_endpoint.reply(200, default_user_media_recent);
			});

			it('should 404 on empty result', function() {
				user_search_endpoint.reply(404, { meta: { code: 200 }, data: [] });

				return expect(instagram.account({ id: 'ACCOUNT_ID' })).to.be.rejected.and.to.eventually.have.property('status', 404);
			});

			it('should 404 on mismatching result', function() {
				default_user_search.data.shift();
				user_search_endpoint.reply(200, default_user_search);

				return expect(instagram.account({ id: 'ACCOUNT_ID' })).to.be.rejected.and.to.eventually.have.property('status', 404);
			});

			it('should 404 on 404', function() {
				user_search_endpoint.reply(404, { meta: { code: 404, error_type: 'idk', error_message: 'I said IDK' } });

				return expect(instagram.account({ id: 'ACCOUNT_ID' })).to.be.rejected.and.to.eventually.have.property('status', 404);
			});

			it('should 429 on OAuthRateLimitException', function() {
				user_search_endpoint.reply(429, { meta: { code: 429, error_type: 'OAuthRateLimitException', error_message: 'The maximum number of requests per hour has been exceeded.' } });

				return expect(instagram.account({ id: 'ACCOUNT_ID' })).to.be.rejected.and.to.eventually.have.property('status', 429);
			});

			it('should 500 on 4xx', function() {
				user_search_endpoint.reply(478, { meta: { code: 478, error_type: 'idk', error_message: 'I said IDK' } });

				var promise = instagram.account({ id: 'ACCOUNT_ID' });

				return Promise.all([
					expect(promise).to.be.rejected.and.to.eventually.have.property('status', 500),
					expect(promise).to.be.rejected.and.to.eventually.have.property('original_status', 478)
				]);
			});

			it('should 502 on 5xx', function() {
				user_search_endpoint.reply(578, { meta: { code: 578, error_type: 'idk', error_message: 'I said IDK' } });

				var promise = instagram.account({ id: 'ACCOUNT_ID' });

				return Promise.all([
					expect(promise).to.be.rejected.and.to.eventually.have.property('status', 502),
					expect(promise).to.be.rejected.and.to.eventually.have.property('original_status', 578)
				]);
			});
		});
	});
});
