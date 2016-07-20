var config    = require('../config');
var chai      = require('chai');
var nock      = require('nock');
var sinon     = require('sinon');
var sinonChai = require('sinon-chai');
var expect    = chai.expect;
chai.use(sinonChai);

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

			default_media_shortcode = { meta: { code: 200 }, data: { type:         'image', comments:     { data:  [{ created_time : '1279341004', text:          'TEXT 1', from:          { username:        'ACCOUNT_ID_1', full_name:       'NAME 1', profile_picture: 'image_1_150_150.jpg' } }, { created_time : '1279332030', text:          'TEXT 2', from:          { username:        'ACCOUNT_ID_2', full_name:       'NAME 2', profile_picture: 'image_2_150_150.jpg' } }], count: 2000 }, caption:      { text: 'TEXT' }, likes:        { count: 1000 }, link:         'http://instagr.am/p/CONTENT_ID/', user:         { username:        'ACCOUNT_ID', full_name:       'ACCOUNT NAME', profile_picture: 'account_image_150_150.jpg' }, created_time: '1279340983', images:       { low_resolution:      { url: 'image_306_306.jpg' }, thumbnail:           { url: 'image_150_150.jpg' }, standard_resolution: { url: 'image_612_612.jpg' } } } };
		});

		it('should callback instagram media', function(done) {
			media_shortcode_endpoint.reply(200, default_media_shortcode);

			instagram.content({ id: 'CONTENT_ID' }, function(err, content) {
				expect(err).not.to.exist;
				expect(content).to.eql({ api:         'instagram', type:        'content', id:          'CONTENT_ID', text:        'TEXT', date:        1279340983000, image:       { small:  'image_150_150.jpg', medium: 'image_306_306.jpg', large:  'image_612_612.jpg' }, stats:       { likes:    1000, comments: 2000 }, account:     { api:   'instagram', type:  'account', id:    'ACCOUNT_ID', name:  'ACCOUNT NAME', image: { medium: 'account_image_150_150.jpg' } }, discussions: [{ api:      'instagram', type:     'discussion', id:       'CONTENT_ID', comments: [{ api:     'instagram', type:    'comment', text:    'TEXT 1', date:    1279341004000, account: { api:   'instagram', type:  'account', id:    'ACCOUNT_ID_1', name:  'NAME 1', image: { medium: 'image_1_150_150.jpg' } } }, { api:     'instagram', type:    'comment', text:    'TEXT 2', date:    1279332030000, account: { api:   'instagram', type:  'account', id:    'ACCOUNT_ID_2', name:  'NAME 2', image: { medium: 'image_2_150_150.jpg' } } }] }] });
				done();
			});
		});

		it('should callback instagram video media', function(done) {
			default_media_shortcode.data.type = 'video',
			default_media_shortcode.data.videos = { standard_resolution: { url: 'video_640_640.mp4' } },
			media_shortcode_endpoint.reply(200, default_media_shortcode);

			instagram.content({ id: 'CONTENT_ID' }, function(err, content) {
				expect(err).not.to.exist;
				expect(content).to.have.property('video').that.eql('video_640_640.mp4');
				done();
			});
		});

		it('should replace hashtags with links in the text', function(done) {
			default_media_shortcode.data.caption.text = '#thing #thing2';
			default_media_shortcode.data.comments.data[0].text = '#thi';
			default_media_shortcode.data.comments.data[1].text = '#thin';
			media_shortcode_endpoint.reply(200, default_media_shortcode);

			instagram.content({ id: 'CONTENT_ID' }, function(err, content) {
				expect(err).not.to.be.ok;
				expect(content).to.have.property('text', '<a href="https://instagram.com/explore/tags/thing" target="_blank">#thing</a> <a href="https://instagram.com/explore/tags/thing2" target="_blank">#thing2</a>');
				expect(content).to.have.deep.property('discussions[0].comments[0].text', '<a href="https://instagram.com/explore/tags/thi" target="_blank">#thi</a>');
				expect(content).to.have.deep.property('discussions[0].comments[1].text', '<a href="https://instagram.com/explore/tags/thin" target="_blank">#thin</a>');
				done();
			});
		});

		it('should replace accounts with links in the text', function(done) {
			default_media_shortcode.data.caption.text = '@ACCOUNT_ID_1 @ACCOUNT_ID_2';
			default_media_shortcode.data.comments.data[0].text = '@ACCOUNT_ID_3';
			default_media_shortcode.data.comments.data[1].text = '@ACCOUNT_ID_4';
			media_shortcode_endpoint.reply(200, default_media_shortcode);

			instagram.content({ id: 'CONTENT_ID' }, function(err, content) {
				expect(err).not.to.be.ok;
				expect(content).to.have.property('text', '<a href="https://instagram.com/ACCOUNT_ID_1/" target="_blank">@ACCOUNT_ID_1</a> <a href="https://instagram.com/ACCOUNT_ID_2/" target="_blank">@ACCOUNT_ID_2</a>');
				expect(content).to.have.deep.property('discussions[0].comments[0].text', '<a href="https://instagram.com/ACCOUNT_ID_3/" target="_blank">@ACCOUNT_ID_3</a>');
				expect(content).to.have.deep.property('discussions[0].comments[1].text', '<a href="https://instagram.com/ACCOUNT_ID_4/" target="_blank">@ACCOUNT_ID_4</a>');
				done();
			});
		});

		it('should remove the default image for account', function(done) {
			default_media_shortcode.data.user.profile_picture = 'https://instagramimages-a.akamaihd.net/profiles/anonymousUser.jpg';
			default_media_shortcode.data.comments.data[0].from.profile_picture = 'https://instagramimages-a.akamaihd.net/profiles/anonymousUser.jpg';
			default_media_shortcode.data.comments.data[1].from.profile_picture = 'https://instagramimages-a.akamaihd.net/profiles/anonymousUser.jpg';
			media_shortcode_endpoint.reply(200, default_media_shortcode);

			instagram.content({ id: 'CONTENT_ID' }, function(err, content) {
				expect(err).not.to.be.ok;
				expect(content).not.to.have.property('account.image');
				expect(content).not.to.have.deep.property('discussions[0].comments[0].account.image');
				expect(content).not.to.have.deep.property('discussions[0].comments[1].account.image');
				done();
			});
		});

		describe('usage', function() {
			it('should report', function(done) {
				media_shortcode_endpoint.reply(200, default_media_shortcode);

				instagram.content({ id: 'CONTENT_ID' }, function(err, content, usage) {
					expect(usage).to.have.property('instagram-calls', 1);
					done();
				});
			});
		});

		describe('media shortcode endpoint', function() {
			it('should 401 on OAuthAccessTokenException', function(done) {
				media_shortcode_endpoint.reply(400, { meta: { code: 400, error_type: 'OAuthAccessTokenException', error_message: 'The access_token provided is invalid.' } });

				instagram.content({ id: 'CONTENT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Instagram Media Shortcode - OAuthAccessTokenException: The access_token provided is invalid.', status: 401 });
					done();
				});
			});

			it('should 401 on APINotAllowedError', function(done) {
				media_shortcode_endpoint.reply(400, { meta: { code: 400, error_type: 'APINotAllowedError', error_message: 'you cannot view this resource' } });

				instagram.content({ id: 'CONTENT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Instagram Media Shortcode - APINotAllowedError: you cannot view this resource', status: 401 });
					done();
				});
			});

			it('should 403 on APINotAllowedError when authorized', function(done) {
				nock('https://api.instagram.com')
					.get('/v1/media/shortcode/CONTENT_ID')
					.query({ access_token: 'INSTAGRAM_USER' })
					.reply(400, { meta: { code: 400, error_type: 'APINotAllowedError', error_message: 'you cannot view this resource' } });

				require('.')({ user: 'INSTAGRAM_USER' }).content({ id: 'CONTENT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Instagram Media Shortcode - APINotAllowedError: you cannot view this resource', status: 403 });
					done();
				});
			});

			it('should 404 on 404', function(done) {
				media_shortcode_endpoint.reply(404, { meta: { code: 404, error_type: 'idk', error_message: 'I said IDK' } });

				instagram.content({ id: 'CONTENT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Instagram Media Shortcode - idk: I said IDK', status: 404 });
					done();
				});
			});

			it('should 429 on OAuthRateLimitException', function(done) {
				media_shortcode_endpoint.reply(429, { meta: { code: 429, error_type: 'OAuthRateLimitException', error_message: 'The maximum number of requests per hour has been exceeded.' } });

				instagram.content({ id: 'CONTENT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Instagram Media Shortcode - OAuthRateLimitException: The maximum number of requests per hour has been exceeded.', status: 429 });
					done();
				});
			});

			it('should 500 on 4xx', function(done) {
				media_shortcode_endpoint.reply(478, { meta: { code: 478, error_type: 'idk', error_message: 'I said IDK' } });

				instagram.content({ id: 'CONTENT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Instagram Media Shortcode - idk: I said IDK', status: 500, original_status: 478 });
					done();
				});
			});

			it('should 502 on 5xx', function(done) {
				media_shortcode_endpoint.reply(578, { meta: { code: 578, error_type: 'idk', error_message: 'I said IDK' } });

				instagram.content({ id: 'CONTENT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Instagram Media Shortcode - idk: I said IDK', status: 502, original_status: 578 });
					done();
				});
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

			default_media_shortcode = { meta: { code: 200 }, data: { comments: { data:  [{ created_time : '1279341004', text:          'TEXT 1', from:          { username:        'ACCOUNT_ID_1', full_name:       'NAME 1', profile_picture: 'image_1_150_150.jpg' } }, { created_time : '1279332030', text:          'TEXT 2', from:          { username:        'ACCOUNT_ID_2', full_name:       'NAME 2', profile_picture: 'image_2_150_150.jpg' } }], count: 1000 }, link:     'http://instagr.am/p/CONTENT_ID/' } };
		});

		it('should callback instagram comments', function(done) {
			media_shortcode_endpoint.reply(200, default_media_shortcode);

			instagram.discussion({ id: 'CONTENT_ID' }, function(err, discussion) {
				expect(err).not.to.exist;
				expect(discussion).to.eql({ api:      'instagram', type:     'discussion', id:       'CONTENT_ID', comments: [{ api:     'instagram', type:    'comment', text:    'TEXT 1', date:    1279341004000, account: { api:   'instagram', type:  'account', id:    'ACCOUNT_ID_1', name:  'NAME 1', image: { medium: 'image_1_150_150.jpg' } } }, { api:     'instagram', type:    'comment', text:    'TEXT 2', date:    1279332030000, account: { api:   'instagram', type:  'account', id:    'ACCOUNT_ID_2', name:  'NAME 2', image: { medium: 'image_2_150_150.jpg' } } }] });
				done();
			});
		});

		it('should replace hashtags with links in the text', function(done) {
			default_media_shortcode.data.comments.data[0].text = '#thi';
			default_media_shortcode.data.comments.data[1].text = '#thin';
			media_shortcode_endpoint.reply(200, default_media_shortcode);

			instagram.discussion({ id: 'CONTENT_ID' }, function(err, discussion) {
				expect(err).not.to.be.ok;
				expect(discussion).to.have.deep.property('comments[0].text', '<a href="https://instagram.com/explore/tags/thi" target="_blank">#thi</a>');
				expect(discussion).to.have.deep.property('comments[1].text', '<a href="https://instagram.com/explore/tags/thin" target="_blank">#thin</a>');
				done();
			});
		});

		it('should replace accounts with links in the text', function(done) {
			default_media_shortcode.data.comments.data[0].text = '@ACCOUNT_ID_1';
			default_media_shortcode.data.comments.data[1].text = '@ACCOUNT_ID_2';
			media_shortcode_endpoint.reply(200, default_media_shortcode);

			instagram.discussion({ id: 'CONTENT_ID' }, function(err, discussion) {
				expect(err).not.to.be.ok;
				expect(discussion).to.have.deep.property('.comments[0].text', '<a href="https://instagram.com/ACCOUNT_ID_1/" target="_blank">@ACCOUNT_ID_1</a>');
				expect(discussion).to.have.deep.property('.comments[1].text', '<a href="https://instagram.com/ACCOUNT_ID_2/" target="_blank">@ACCOUNT_ID_2</a>');
				done();
			});
		});

		it('should remove the default image for account', function(done) {
			default_media_shortcode.data.comments.data[0].from.profile_picture = 'https://instagramimages-a.akamaihd.net/profiles/anonymousUser.jpg';
			default_media_shortcode.data.comments.data[1].from.profile_picture = 'https://instagramimages-a.akamaihd.net/profiles/anonymousUser.jpg';
			media_shortcode_endpoint.reply(200, default_media_shortcode);

			instagram.discussion({ id: 'CONTENT_ID' }, function(err, discussion) {
				expect(err).not.to.be.ok;
				expect(discussion).not.to.have.property('account.image');
				expect(discussion).not.to.have.deep.property('comments[0].account.image');
				expect(discussion).not.to.have.deep.property('comments[1].account.image');
				done();
			});
		});

		describe('usage', function() {
			it('should report', function(done) {
				media_shortcode_endpoint.reply(200, default_media_shortcode);

				instagram.discussion({ id: 'CONTENT_ID' }, function(err, discussion, usage) {
					expect(usage).to.have.property('instagram-calls', 1);
					done();
				});
			});
		});

		describe('media shortcode endpoint', function() {
			it('should 401 on OAuthAccessTokenException', function(done) {
				media_shortcode_endpoint.reply(400, { meta: { code: 400, error_type: 'OAuthAccessTokenException', error_message: 'The access_token provided is invalid.' } });

				instagram.discussion({ id: 'CONTENT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Instagram Media Shortcode - OAuthAccessTokenException: The access_token provided is invalid.', status: 401 });
					done();
				});
			});

			it('should 401 on APINotAllowedError', function(done) {
				media_shortcode_endpoint.reply(400, { meta: { code: 400, error_type: 'APINotAllowedError', error_message: 'you cannot view this resource' } });

				instagram.discussion({ id: 'CONTENT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Instagram Media Shortcode - APINotAllowedError: you cannot view this resource', status: 401 });
					done();
				});
			});

			it('should 403 on APINotAllowedError when authorized', function(done) {
				nock('https://api.instagram.com')
					.get('/v1/media/shortcode/CONTENT_ID')
					.query({ access_token: 'INSTAGRAM_USER' })
					.reply(400, { meta: { code: 400, error_type: 'APINotAllowedError', error_message: 'you cannot view this resource' } });

				require('.')({ user: 'INSTAGRAM_USER' }).discussion({ id: 'CONTENT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Instagram Media Shortcode - APINotAllowedError: you cannot view this resource', status: 403 });
					done();
				});
			});

			it('should 404 on 404', function(done) {
				media_shortcode_endpoint.reply(404, { meta: { code: 404, error_type: 'idk', error_message: 'I said IDK' } });

				instagram.discussion({ id: 'CONTENT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Instagram Media Shortcode - idk: I said IDK', status: 404 });
					done();
				});
			});

			it('should 429 on OAuthRateLimitException', function(done) {
				media_shortcode_endpoint.reply(429, { meta: { code: 429, error_type: 'OAuthRateLimitException', error_message: 'The maximum number of requests per hour has been exceeded.' } });

				instagram.discussion({ id: 'CONTENT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Instagram Media Shortcode - OAuthRateLimitException: The maximum number of requests per hour has been exceeded.', status: 429 });
					done();
				});
			});

			it('should 500 on 4xx', function(done) {
				media_shortcode_endpoint.reply(478, { meta: { code: 478, error_type: 'idk', error_message: 'I said IDK' } });

				instagram.discussion({ id: 'CONTENT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Instagram Media Shortcode - idk: I said IDK', status: 500, original_status: 478 });
					done();
				});
			});

			it('should 502 on 5xx', function(done) {
				media_shortcode_endpoint.reply(578, { meta: { code: 578, error_type: 'idk', error_message: 'I said IDK' } });

				instagram.discussion({ id: 'CONTENT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Instagram Media Shortcode - idk: I said IDK', status: 502, original_status: 578 });
					done();
				});
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

			default_user = { meta: { code: 200 }, data: { id:              'INSTAGRAM_ACCOUNT_ID', username:        'ACCOUNT_ID', full_name:       'NAME', profile_picture: 'image_150_150.jpg', bio:             'TEXT', website:         'https://www.google.com/', counts:          { media:       1000, follows:     3000, followed_by: 2000 } } };
			default_user_media_recent = { meta: { code: 200 }, data: [{ comments:     { count: 1002 }, likes:        { count: 1001 }, link:         'http://instagr.am/p/CONTENT_1/', created_time: '1296710327', images:       { low_resolution:      { url: 'image_1_306_306.jpg' }, thumbnail:           { url: 'image_1_150_150.jpg' }, standard_resolution: { url: 'image_1_612_612.jpg' } }, type:         'image' }, { videos:       { standard_resolution: { url: 'video_640_640.mp4' } }, comments:     { count: 2002 }, likes:        { count: 2001 }, link:         'http://instagr.am/p/CONTENT_2/', created_time: '1296710327', images:       { low_resolution:      { url: 'image_2_306_306.jpg' }, thumbnail:           { url: 'image_2_150_150.jpg' }, standard_resolution: { url: 'image_2_612_612.jpg' } }, type:         'video' }] };
			default_user_search = { meta: { code: 200 }, data: [{ username:        'ACCOUNT_ID', full_name:       'NAME', profile_picture: 'image_150_150.jpg', id:              'INSTAGRAM_ACCOUNT_ID' }, { username:        'ACCOUNT_ID_2', full_name:       'NAME_2', profile_picture: 'image_2_150_150.jpg', id:              'INSTAGRAM_ACCOUNT_ID_2' }, { username:        'ACCOUNT_ID_3', full_name:       'NAME_3', profile_picture: 'image_3_150_150.jpg', id:              'INSTAGRAM_ACCOUNT_ID_3' }] };
		});

		afterEach(function() {
			sandbox.restore();
		});


		it('should callback instagram user', function(done) {
			user_endpoint.reply(200, default_user);
			user_media_recent_endpoint.reply(200, default_user_media_recent);
			user_search_endpoint.reply(200, default_user_search);

			instagram.account({ id: 'ACCOUNT_ID' }, function(err, account) {
				expect(err).not.to.be.ok;
				expect(account).to.eql({ api:     'instagram', type:    'account', id:      'ACCOUNT_ID', name:    'NAME', text:    'TEXT', image:   { medium: 'image_150_150.jpg' }, stats:   { content:    1000, followers:  2000, following:  3000 }, content: { api:     'instagram', type:    'account_content', id:      'ACCOUNT_ID', content: [{ api:   'instagram', type:  'content', id:    'CONTENT_1', date:  1296710327000, image: { small:  'image_1_150_150.jpg', medium: 'image_1_306_306.jpg', large:  'image_1_612_612.jpg' }, stats: { likes:    1001, comments: 1002 } }, { api:   'instagram', type:  'content', id:    'CONTENT_2', date:  1296710327000, image: { small:  'image_2_150_150.jpg', medium: 'image_2_306_306.jpg', large:  'image_2_612_612.jpg' }, video: 'video_640_640.mp4', stats: { likes:    2001, comments: 2002 } }] } });
				done();
			});
		});

		it('should reference accounts in text', function(done) {
			default_user.data.bio = 'https://www.wenoknow.com https://www.hovercards.com';
			user_endpoint.reply(200, default_user);
			user_media_recent_endpoint.reply(200, default_user_media_recent);
			user_search_endpoint.reply(200, default_user_search);

			urls.parse.withArgs('https://www.wenoknow.com').returns({ api: 'some_api', type: 'account', id: 'ACCOUNT_ID_1' });
			urls.parse.withArgs('https://www.hovercards.com').returns({ api: 'some_api', type: 'account', id: 'ACCOUNT_ID_2' });

			instagram.account({ id: 'ACCOUNT_ID' }, function(err, account) {
				expect(err).not.to.be.ok;
				expect(account.accounts).to.contain({ api: 'some_api', type: 'account', id: 'ACCOUNT_ID_1' });
				expect(account.accounts).to.contain({ api: 'some_api', type: 'account', id: 'ACCOUNT_ID_2' });
				done();
			});
		});

		it('should reference account in website', function(done) {
			default_user.data.website = 'https://www.hovercards.com';
			user_endpoint.reply(200, default_user);
			user_media_recent_endpoint.reply(200, default_user_media_recent);
			user_search_endpoint.reply(200, default_user_search);

			urls.parse.withArgs('https://www.hovercards.com').returns({ api: 'some_api', type: 'account', id: 'ACCOUNT_ID_1' });

			instagram.account({ id: 'ACCOUNT_ID' }, function(err, account) {
				expect(err).not.to.be.ok;
				expect(account.accounts).to.contain({ api: 'some_api', type: 'account', id: 'ACCOUNT_ID_1' });
				done();
			});
		});

		it('should replace hashtags with links in the text', function(done) {
			default_user.data.bio = '#thing #thing2';
			user_endpoint.reply(200, default_user);
			user_media_recent_endpoint.reply(200, default_user_media_recent);
			user_search_endpoint.reply(200, default_user_search);

			instagram.account({ id: 'ACCOUNT_ID' }, function(err, account) {
				expect(err).not.to.be.ok;
				expect(account).to.have.property('text', '<a href="https://instagram.com/explore/tags/thing" target="_blank">#thing</a> <a href="https://instagram.com/explore/tags/thing2" target="_blank">#thing2</a>');
				done();
			});
		});

		it('should replace accounts with links in the text', function(done) {
			default_user.data.bio = '@ACCOUNT_ID_1 @ACCOUNT_ID_2';
			user_endpoint.reply(200, default_user);
			user_media_recent_endpoint.reply(200, default_user_media_recent);
			user_search_endpoint.reply(200, default_user_search);

			instagram.account({ id: 'ACCOUNT_ID' }, function(err, account) {
				expect(err).not.to.be.ok;
				expect(account).to.have.property('text', '<a href="https://instagram.com/ACCOUNT_ID_1/" target="_blank">@ACCOUNT_ID_1</a> <a href="https://instagram.com/ACCOUNT_ID_2/" target="_blank">@ACCOUNT_ID_2</a>');
				done();
			});
		});

		it('should remove the default image', function(done) {
			default_user.data.profile_picture = 'https://instagramimages-a.akamaihd.net/profiles/anonymousUser.jpg';
			user_endpoint.reply(200, default_user);
			user_media_recent_endpoint.reply(200, default_user_media_recent);
			user_search_endpoint.reply(200, default_user_search);

			instagram.account({ id: 'ACCOUNT_ID' }, function(err, account) {
				expect(err).not.to.be.ok;
				expect(account).not.to.have.property('image');
				done();
			});
		});

		describe('usage', function() {
			it('should report', function(done) {
				user_endpoint.reply(200, default_user);
				user_media_recent_endpoint.reply(200, default_user_media_recent);
				user_search_endpoint.reply(200, default_user_search);

				instagram.account({ id: 'ACCOUNT_ID' }, function(err, account, usage) {
					expect(usage).to.have.property('instagram-calls', 3);
					done();
				});
			});

			it('should not report instagram-calls on search failure', function(done) {
				user_endpoint.reply(200, default_user);
				user_media_recent_endpoint.reply(200, default_user_media_recent);
				user_search_endpoint.reply(404, { meta: { code: 404, error_type: 'idk', error_message: 'I said IDK' } });

				instagram.account({ id: 'ACCOUNT_ID' }, function(err, account, usage) {
					expect(usage).to.have.property('instagram-calls', 1);
					done();
				});
			});
		});

		describe('user endpoint', function() {
			beforeEach(function() {
				user_search_endpoint.reply(200, default_user_search);
				user_media_recent_endpoint.reply(200, default_user_media_recent);
			});

			it('should 401 on OAuthAccessTokenException', function(done) {
				user_endpoint.reply(400, { meta: { code: 400, error_type: 'OAuthAccessTokenException', error_message: 'The access_token provided is invalid.' } });

				instagram.account({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Instagram User - OAuthAccessTokenException: The access_token provided is invalid.', status: 401 });
					done();
				});
			});

			it('should 401 on APINotAllowedError', function(done) {
				user_endpoint.reply(400, { meta: { code: 400, error_type: 'APINotAllowedError', error_message: 'you cannot view this resource' } });

				instagram.account({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Instagram User - APINotAllowedError: you cannot view this resource', status: 401 });
					done();
				});
			});

			it('should 403 on APINotAllowedError when authorized', function(done) {
				nock('https://api.instagram.com')
					.get('/v1/users/INSTAGRAM_ACCOUNT_ID')
					.query({ access_token: 'INSTAGRAM_USER' })
					.reply(400, { meta: { code: 400, error_type: 'APINotAllowedError', error_message: 'you cannot view this resource' } });
				nock('https://api.instagram.com')
					.get('/v1/users/search')
					.query({ access_token: 'INSTAGRAM_USER', q: 'ACCOUNT_ID' })
					.reply(200, default_user_search);

				require('.')({ user: 'INSTAGRAM_USER' }).account({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Instagram User - APINotAllowedError: you cannot view this resource', status: 403 });
					done();
				});
			});

			it('should 404 on 404', function(done) {
				user_endpoint.reply(404, { meta: { code: 404, error_type: 'idk', error_message: 'I said IDK' } });

				instagram.account({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Instagram User - idk: I said IDK', status: 404 });
					done();
				});
			});

			it('should 429 on OAuthRateLimitException', function(done) {
				user_endpoint.reply(429, { meta: { code: 429, error_type: 'OAuthRateLimitException', error_message: 'The maximum number of requests per hour has been exceeded.' } });

				instagram.account({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Instagram User - OAuthRateLimitException: The maximum number of requests per hour has been exceeded.', status: 429 });
					done();
				});
			});

			it('should 500 on 4xx', function(done) {
				user_endpoint.reply(478, { meta: { code: 478, error_type: 'idk', error_message: 'I said IDK' } });

				instagram.account({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Instagram User - idk: I said IDK', status: 500, original_status: 478 });
					done();
				});
			});

			it('should 502 on 5xx', function(done) {
				user_endpoint.reply(578, { meta: { code: 578, error_type: 'idk', error_message: 'I said IDK' } });

				instagram.account({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Instagram User - idk: I said IDK', status: 502, original_status: 578 });
					done();
				});
			});
		});

		describe('user media recent endpoint', function() {
			beforeEach(function() {
				user_endpoint.reply(200, default_user);
				user_search_endpoint.reply(200, default_user_search);
			});

			it('should not have content on err', function(done) {
				user_media_recent_endpoint.reply(404, { meta: { code: 404, error_type: 'idk', error_message: 'I said IDK' } });

				instagram.account({ id: 'ACCOUNT_ID' }, function(err, account) {
					expect(err).not.to.be.ok;
					expect(account).to.be.ok;
					expect(account).not.to.have.property('content');
					done();
				});
			});
		});

		describe('user search endpoint', function() {
			beforeEach(function() {
				user_endpoint.reply(200, default_user);
				user_media_recent_endpoint.reply(200, default_user_media_recent);
			});

			it('should 404 on empty result', function(done) {
				user_search_endpoint.reply(404, { meta: { code: 200 }, data: [] });

				instagram.account({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Instagram User Search', status: 404 });
					done();
				});
			});

			it('should 404 on mismatching result', function(done) {
				default_user_search.data.shift();
				user_search_endpoint.reply(200, default_user_search);

				instagram.account({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Instagram User Search', status: 404 });
					done();
				});
			});

			it('should 404 on 404', function(done) {
				user_search_endpoint.reply(404, { meta: { code: 404, error_type: 'idk', error_message: 'I said IDK' } });

				instagram.account({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Instagram User Search - idk: I said IDK', status: 404 });
					done();
				});
			});

			it('should 429 on OAuthRateLimitException', function(done) {
				user_search_endpoint.reply(429, { meta: { code: 429, error_type: 'OAuthRateLimitException', error_message: 'The maximum number of requests per hour has been exceeded.' } });

				instagram.account({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Instagram User Search - OAuthRateLimitException: The maximum number of requests per hour has been exceeded.', status: 429 });
					done();
				});
			});

			it('should 500 on 4xx', function(done) {
				user_search_endpoint.reply(478, { meta: { code: 478, error_type: 'idk', error_message: 'I said IDK' } });

				instagram.account({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Instagram User Search - idk: I said IDK', status: 500, original_status: 478 });
					done();
				});
			});

			it('should 502 on 5xx', function(done) {
				user_search_endpoint.reply(578, { meta: { code: 578, error_type: 'idk', error_message: 'I said IDK' } });

				instagram.account({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Instagram User Search - idk: I said IDK', status: 502, original_status: 578 });
					done();
				});
			});
		});
	});

	describe('.account_content', function() {
		var user_media_recent_endpoint;
		var user_search_endpoint;
		var default_user_media_recent;
		var default_user_search;

		beforeEach(function() {
			user_media_recent_endpoint = nock('https://api.instagram.com')
				.get('/v1/users/INSTAGRAM_ACCOUNT_ID/media/recent')
				.query({ client_id: 'INSTAGRAM_CLIENT_ID', client_secret: 'INSTAGRAM_CLIENT_SECRET', count: config.counts.grid });
			user_search_endpoint = nock('https://api.instagram.com')
				.get('/v1/users/search')
				.query({ client_id: 'INSTAGRAM_CLIENT_ID', client_secret: 'INSTAGRAM_CLIENT_SECRET', q: 'ACCOUNT_ID' });

			default_user_media_recent = { meta: { code: 200 }, data: [{ comments:     { count: 1002 }, likes:        { count: 1001 }, link:         'http://instagr.am/p/CONTENT_1/', created_time: '1296710327', images:       { low_resolution:      { url: 'image_1_306_306.jpg' }, thumbnail:           { url: 'image_1_150_150.jpg' }, standard_resolution: { url: 'image_1_612_612.jpg' } }, type:         'image' }, { videos:       { standard_resolution: { url: 'video_640_640.mp4' } }, comments:     { count: 2002 }, likes:        { count: 2001 }, link:         'http://instagr.am/p/CONTENT_2/', created_time: '1296710327', images:       { low_resolution:      { url: 'image_2_306_306.jpg' }, thumbnail:           { url: 'image_2_150_150.jpg' }, standard_resolution: { url: 'image_2_612_612.jpg' } }, type:         'video' }] };
			default_user_search = { meta: { code: 200 }, data: [{ username:        'ACCOUNT_ID', full_name:       'NAME', profile_picture: 'image_150_150.jpg', id:              'INSTAGRAM_ACCOUNT_ID' }, { username:        'ACCOUNT_ID_2', full_name:       'NAME_2', profile_picture: 'image_2_150_150.jpg', id:              'INSTAGRAM_ACCOUNT_ID_2' }, { username:        'ACCOUNT_ID_3', full_name:       'NAME_3', profile_picture: 'image_3_150_150.jpg', id:              'INSTAGRAM_ACCOUNT_ID_3' }] };
		});

		it('should callback instagram media', function(done) {
			user_media_recent_endpoint.reply(200, default_user_media_recent);
			user_search_endpoint.reply(200, default_user_search);

			instagram.account_content({ id: 'ACCOUNT_ID' }, function(err, account_content) {
				expect(err).not.to.be.ok;
				expect(account_content).to.eql({ api:     'instagram', type:    'account_content', id:      'ACCOUNT_ID', content: [{ api:   'instagram', type:  'content', id:    'CONTENT_1', date:  1296710327000, image: { small:  'image_1_150_150.jpg', medium: 'image_1_306_306.jpg', large:  'image_1_612_612.jpg' }, stats: { likes:    1001, comments: 1002 } }, { api:   'instagram', type:  'content', id:    'CONTENT_2', date:  1296710327000, image: { small:  'image_2_150_150.jpg', medium: 'image_2_306_306.jpg', large:  'image_2_612_612.jpg' }, video: 'video_640_640.mp4', stats: { likes:    2001, comments: 2002 } }] });
				done();
			});
		});

		describe('usage', function() {
			it('should report', function(done) {
				user_media_recent_endpoint.reply(200, default_user_media_recent);
				user_search_endpoint.reply(200, default_user_search);

				instagram.account_content({ id: 'ACCOUNT_ID' }, function(err, account_content, usage) {
					expect(usage).to.have.property('instagram-calls', 2);
					done();
				});
			});
		});

		describe('user media recent endpoint', function() {
			beforeEach(function() {
				user_search_endpoint.reply(200, default_user_search);
			});

			it('should 401 on OAuthAccessTokenException', function(done) {
				user_media_recent_endpoint.reply(400, { meta: { code: 400, error_type: 'OAuthAccessTokenException', error_message: 'The access_token provided is invalid.' } });

				instagram.account_content({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Instagram User Media Recent - OAuthAccessTokenException: The access_token provided is invalid.', status: 401 });
					done();
				});
			});

			it('should 401 on APINotAllowedError', function(done) {
				user_media_recent_endpoint.reply(400, { meta: { code: 400, error_type: 'APINotAllowedError', error_message: 'you cannot view this resource' } });

				instagram.account_content({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Instagram User Media Recent - APINotAllowedError: you cannot view this resource', status: 401 });
					done();
				});
			});

			it('should 403 on APINotAllowedError when authorized', function(done) {
				nock('https://api.instagram.com')
					.get('/v1/users/INSTAGRAM_ACCOUNT_ID/media/recent')
					.query({ access_token: 'INSTAGRAM_USER', count: config.counts.grid })
					.reply(400, { meta: { code: 400, error_type: 'APINotAllowedError', error_message: 'you cannot view this resource' } });
				nock('https://api.instagram.com')
					.get('/v1/users/search')
					.query({ access_token: 'INSTAGRAM_USER', q: 'ACCOUNT_ID' })
					.reply(200, default_user_search);

				require('.')({ user: 'INSTAGRAM_USER' }).account_content({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Instagram User Media Recent - APINotAllowedError: you cannot view this resource', status: 403 });
					done();
				});
			});

			it('should 404 on 404', function(done) {
				user_media_recent_endpoint.reply(404, { meta: { code: 404, error_type: 'idk', error_message: 'I said IDK' } });

				instagram.account_content({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Instagram User Media Recent - idk: I said IDK', status: 404 });
					done();
				});
			});

			it('should 429 on OAuthRateLimitException', function(done) {
				user_media_recent_endpoint.reply(429, { meta: { code: 429, error_type: 'OAuthRateLimitException', error_message: 'The maximum number of requests per hour has been exceeded.' } });

				instagram.account_content({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Instagram User Media Recent - OAuthRateLimitException: The maximum number of requests per hour has been exceeded.', status: 429 });
					done();
				});
			});

			it('should 500 on 4xx', function(done) {
				user_media_recent_endpoint.reply(478, { meta: { code: 478, error_type: 'idk', error_message: 'I said IDK' } });

				instagram.account_content({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Instagram User Media Recent - idk: I said IDK', status: 500, original_status: 478 });
					done();
				});
			});

			it('should 502 on 5xx', function(done) {
				user_media_recent_endpoint.reply(578, { meta: { code: 578, error_type: 'idk', error_message: 'I said IDK' } });

				instagram.account_content({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Instagram User Media Recent - idk: I said IDK', status: 502, original_status: 578 });
					done();
				});
			});
		});

		describe('user search endpoint', function() {
			beforeEach(function() {
				user_media_recent_endpoint.reply(200, default_user_media_recent);
			});

			it('should 404 on empty result', function(done) {
				user_search_endpoint.reply(404, { meta: { code: 200 }, data: [] });

				instagram.account_content({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Instagram User Search', status: 404 });
					done();
				});
			});

			it('should 404 on mismatching result', function(done) {
				default_user_search.data.shift();
				user_search_endpoint.reply(200, default_user_search);

				instagram.account_content({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Instagram User Search', status: 404 });
					done();
				});
			});

			it('should 404 on 404', function(done) {
				user_search_endpoint.reply(404, { meta: { code: 404, error_type: 'idk', error_message: 'I said IDK' } });

				instagram.account_content({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Instagram User Search - idk: I said IDK', status: 404 });
					done();
				});
			});

			it('should 429 on OAuthRateLimitException', function(done) {
				user_search_endpoint.reply(429, { meta: { code: 429, error_type: 'OAuthRateLimitException', error_message: 'The maximum number of requests per hour has been exceeded.' } });

				instagram.account_content({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Instagram User Search - OAuthRateLimitException: The maximum number of requests per hour has been exceeded.', status: 429 });
					done();
				});
			});

			it('should 500 on 4xx', function(done) {
				user_search_endpoint.reply(478, { meta: { code: 478, error_type: 'idk', error_message: 'I said IDK' } });

				instagram.account_content({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Instagram User Search - idk: I said IDK', status: 500, original_status: 478 });
					done();
				});
			});

			it('should 502 on 5xx', function(done) {
				user_search_endpoint.reply(578, { meta: { code: 578, error_type: 'idk', error_message: 'I said IDK' } });

				instagram.account_content({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Instagram User Search - idk: I said IDK', status: 502, original_status: 578 });
					done();
				});
			});
		});
	});
});

describe('instagram urls', function() {
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
			it('from instagram.com/p/CONTENT_ID', function() {
				expect(urls.parse(url.parse('https://www.instagram.com/p/CONTENT_ID', true, true)))
					.to.eql({ api: 'instagram', type: 'content', id: 'CONTENT_ID' });
			});

			it('from instagram.com/p/CONTENT_ID/embed/captioned', function() {
				expect(urls.parse(url.parse('https://www.instagram.com/p/CONTENT_ID/embed/captioned/?v=4', true, true)))
					.to.eql({ api: 'instagram', type: 'content', id: 'CONTENT_ID' });
			});

			it('from instagr.am/p/CONTENT_ID', function() {
				expect(urls.parse(url.parse('https://instagr.am/p/CONTENT_ID', true, true)))
					.to.eql({ api: 'instagram', type: 'content', id: 'CONTENT_ID' });
			});

			it('from instagr.am/p/CONTENT_ID/embed/captioned', function() {
				expect(urls.parse(url.parse('https://instagr.am/p/CONTENT_ID/embed/captioned/?v=4', true, true)))
					.to.eql({ api: 'instagram', type: 'content', id: 'CONTENT_ID' });
			});
		});

		describe('into account', function() {
			it('from instagram.com/ACCOUNT_ID', function() {
				expect(urls.parse(url.parse('https://www.instagram.com/ACCOUNT_ID', true, true)))
					.to.eql({ api: 'instagram', type: 'account', id: 'ACCOUNT_ID' });
			});

			it('from instagr.am/ACCOUNT_ID', function() {
				expect(urls.parse(url.parse('https://www.instagram.com/ACCOUNT_ID', true, true)))
					.to.eql({ api: 'instagram', type: 'account', id: 'ACCOUNT_ID' });
			});

			it('not from instagram.com/about', function() {
				expect(urls.parse(url.parse('https://www.instagram.com/about', true, true))).not.to.be.ok;
			});

			it('not from instagram.com/developer', function() {
				expect(urls.parse(url.parse('https://www.instagram.com/developer', true, true))).not.to.be.ok;
			});

			it('not from instagram.com/explore', function() {
				expect(urls.parse(url.parse('https://www.instagram.com/explore', true, true))).not.to.be.ok;
			});

			it('not from instagram.com/legal', function() {
				expect(urls.parse(url.parse('https://www.instagram.com/legal', true, true))).not.to.be.ok;
			});

			it('not from instagram.com/press', function() {
				expect(urls.parse(url.parse('https://www.instagram.com/press', true, true))).not.to.be.ok;
			});
		});
	});

	describe('.represent', function() {
		it('should represent content', function() {
			var representations = urls.represent({ type: 'content', id: 'CONTENT_ID' });
			expect(representations).to.contain('https://instagram.com/p/CONTENT_ID/');
			expect(representations).to.contain('https://instagr.am/p/CONTENT_ID/');
		});

		it('should represent account', function() {
			var representations = urls.represent({ type: 'account', id: 'ACCOUNT_ID' });
			expect(representations).to.contain('https://instagram.com/ACCOUNT_ID/');
			expect(representations).to.contain('https://instagr.am/ACCOUNT_ID/');
		});
	});
});
