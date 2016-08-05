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

describe('reddit', function() {
	var reddit;

	/*
	before(function() {
		nock.recorder.rec();
	});
	*/

	beforeEach(function() {
		reddit = require('.')({ key: 'REDDIT_SERVER_KEY', device_id: 'DEVICE_ID_1111111111', test: true });

		nock('https://www.reddit.com')
			.post('/api/v1/access_token', 'scope=read%2Chistory&grant_type=https%3A%2F%2Foauth.reddit.com%2Fgrants%2Finstalled_client&device_id=DEVICE_ID_1111111111&api_type=json')
			.reply(200, { access_token: 'ACCESS_TOKEN', token_type: 'bearer', expires_in: 3600, scope: 'history read' });
	});

	afterEach(function() {
		nock.cleanAll();
	});

	describe('.content', function() {
		var article_comments_endpoint;
		var default_article_comments;

		beforeEach(function() {
			article_comments_endpoint = nock('https://oauth.reddit.com')
				.get('/comments/CONTENT_ID')
				.matchHeader('authorization', 'bearer ACCESS_TOKEN')
				.query({ limit: config.counts.listed, api_type: 'json' });

			default_article_comments = [
				{
					kind: 'Listing',
					data: { children: [{
						kind: 't3',
						data: {
							subreddit:     'SUBREDDIT',
							selftext_html: '<div class="md"><p>TEXT</p>\n</div>',
							id:            'CONTENT_ID',
							author:        'ACCOUNT_ID',
							score:         1000,
							is_self:       true,
							title:         'TITLE',
							created_utc:   1440189331,
							upvote_ratio:  0.1,
							num_comments:  2000
						}
					}] }
				},
				{
					kind: 'Listing',
					data: { children: [] }
				}
			];
		});

		it('should callback reddit post', function() {
			article_comments_endpoint.reply(200, default_article_comments);

			return expect(reddit.content({ id: 'CONTENT_ID' })).to.eventually.eql({
				api:       'reddit',
				type:      'content',
				id:        'CONTENT_ID',
				name:      'TITLE',
				text:      '<p>TEXT</p>',
				date:      1440189331000,
				subreddit: 'SUBREDDIT',
				stats:     {
					score:       1000,
					score_ratio: 0.1,
					comments:    2000
				},
				account: {
					api:  'reddit',
					type: 'account',
					id:   'ACCOUNT_ID'
				}
			});
		});

		it('should include urls for link posts', function() {
			delete default_article_comments[0].data.children[0].data.selftext_html;
			default_article_comments[0].data.children[0].data.is_self = false;
			default_article_comments[0].data.children[0].data.url = 'https://www.hovercards.com';
			article_comments_endpoint.reply(200, default_article_comments);

			var promise = reddit.content({ id: 'CONTENT_ID' });

			return Promise.all([
				expect(promise).to.eventually.not.have.property('text'),
				expect(promise).to.eventually.have.property('url', 'https://www.hovercards.com')
			]);
		});

		it('should ignore [deleted] accounts', function() {
			default_article_comments[0].data.children[0].data.author = '[deleted]';
			article_comments_endpoint.reply(200, default_article_comments);

			return expect(reddit.content({ id: 'CONTENT_ID' })).to.eventually.not.have.property('account');
		});

		it('should include image', function() {
			default_article_comments[0].data.children[0].data.preview = {
				images: [
					{
						resolutions: [
							{ height: 60, width: 108, url: 'image_small.jpg' },
							{ height: 121, width: 216, url: 'image_no.jpg' },
							{ height: 180, width: 320, url: 'image_medium.jpg' },
							{ height: 360, width: 640, url: 'image_large.jpg' },
							{ height: 540, width: 960, url: 'image_no.jpg' },
							{ height: 607, width: 1080, url: 'image_no.jpg' }
						],
						source: { height: 720, width: 1280, url: 'image.jpg' }
					}
				]
			};
			article_comments_endpoint.reply(200, default_article_comments);

			return expect(reddit.content({ id: 'CONTENT_ID' })).to.eventually.have.property('image')
				.that.eql({ small: 'image_small.jpg', medium: 'image_medium.jpg', large: 'image_large.jpg' });
		});

		it('should include oembed post', function() {
			default_article_comments[0].data.children[0].data.media = {
				oembed: {
					html: '&lt;iframe&gt;&lt;/iframe&gt;'
				}
			};
			article_comments_endpoint.reply(200, default_article_comments);

			return expect(reddit.content({ id: 'CONTENT_ID' })).to.eventually.have.property('oembed', '<iframe></iframe>');
		});

		describe('article comments endpoint', function() {
			it('should try again on 401', function() {
				article_comments_endpoint.reply(401, '');
				nock('https://www.reddit.com')
					.post('/api/v1/access_token', 'scope=read%2Chistory&grant_type=https%3A%2F%2Foauth.reddit.com%2Fgrants%2Finstalled_client&device_id=DEVICE_ID_1111111111&api_type=json')
					.reply(200, { access_token: 'ACCESS_TOKEN_2', token_type: 'bearer', expires_in: 3600, scope: 'history read' });
				nock('https://oauth.reddit.com')
					.get('/comments/CONTENT_ID')
					.matchHeader('authorization', 'bearer ACCESS_TOKEN_2')
					.query({ limit: config.counts.listed, api_type: 'json' })
					.reply(200, default_article_comments);

				return expect(reddit.content({ id: 'CONTENT_ID' })).to.not.be.rejected;
			});

			it('should 404 on 404', function() {
				article_comments_endpoint.reply(404, '');

				return expect(reddit.content({ id: 'CONTENT_ID' })).to.be.rejected.and.to.eventually.have.property('status', 404);
			});

			it('should 429 on 429', function() {
				article_comments_endpoint.reply(429, '');

				return expect(reddit.content({ id: 'CONTENT_ID' })).to.be.rejected.and.to.eventually.have.property('status', 429);
			});

			it('should 500 on 4xx', function() {
				article_comments_endpoint.reply(478, '');

				var promise = reddit.content({ id: 'CONTENT_ID' });

				return Promise.all([
					expect(promise).to.be.rejected.and.to.eventually.have.property('status', 500),
					expect(promise).to.be.rejected.and.to.eventually.have.property('original_status', 478)
				]);
			});

			it('should 502 on 5xx', function() {
				article_comments_endpoint
					.twice()
					.reply(578, '');

				var promise = reddit.content({ id: 'CONTENT_ID' });

				return Promise.all([
					expect(promise).to.be.rejected.and.to.eventually.have.property('status', 502),
					expect(promise).to.be.rejected.and.to.eventually.have.property('original_status', 578)
				]);
			});
		});
	});

	describe('.discussion', function() {
		var article_comments_endpoint;
		var default_article_comments;

		beforeEach(function() {
			article_comments_endpoint = nock('https://oauth.reddit.com')
				.get('/comments/CONTENT_ID')
				.matchHeader('authorization', 'bearer ACCESS_TOKEN')
				.query({ limit: config.counts.listed, api_type: 'json' });

			default_article_comments = [
				{
					kind: 'Listing',
					data: {
						children: [{
							kind: 't3',
							data: {
								subreddit:    'SUBREDDIT',
								id:           'CONTENT_ID',
								author:       'ACCOUNT_ID',
								score:        1000,
								is_self:      true,
								title:        'TITLE',
								created_utc:  1440189331,
								upvote_ratio: 0.1,
								num_comments: 2000
							}
						}]
					}
				},
				{
					kind: 'Listing',
					data: {
						children: [
							{
								kind: 't1',
								data: {
									replies:     '',
									id:          'COMMENT_ID_1',
									author:      'ACCOUNT_ID_1',
									score:       1000,
									body_html:   '<div class="md"><p>TEXT 1</p>\n</div>',
									created_utc: 1440189331
								}
							},
							{
								kind: 't1',
								data: {
									replies:     '',
									id:          'COMMENT_ID_2',
									author:      'ACCOUNT_ID_2',
									score:       2000,
									body_html:   '<div class="md"><p>TEXT 2</p>\n</div>',
									created_utc: 1440189331
								}
							},
							{
								kind: 'more',
								data: {
									count:    2,
									children: ['COMMENT_ID_3', 'COMMENT_ID_4'],
									id:       'COMMENT_ID_3'
								}
							}]
					}
				}
			];
		});

		it('should callback reddit comments', function() {
			article_comments_endpoint.reply(200, default_article_comments);

			return expect(reddit.discussion({ id: 'CONTENT_ID' })).to.eventually.eql({
				api:     'reddit',
				type:    'discussion',
				id:      'CONTENT_ID',
				content: {
					api:       'reddit',
					type:      'content',
					id:        'CONTENT_ID',
					name:      'TITLE',
					date:      1440189331000,
					subreddit: 'SUBREDDIT',
					stats:     {
						score:       1000,
						score_ratio: 0.1,
						comments:    2000
					},
					account: {
						api:  'reddit',
						type: 'account',
						id:   'ACCOUNT_ID'
					}
				},
				comments: [
					{
						api:   'reddit',
						type:  'comment',
						id:    'COMMENT_ID_1',
						text:  '<p>TEXT 1</p>',
						date:  1440189331000,
						stats: {
							score: 1000
						},
						account: {
							api:  'reddit',
							type: 'account',
							id:   'ACCOUNT_ID_1'
						}
					},
					{
						api:   'reddit',
						type:  'comment',
						id:    'COMMENT_ID_2',
						text:  '<p>TEXT 2</p>',
						date:  1440189331000,
						stats: {
							score: 2000
						},
						account: {
							api:  'reddit',
							type: 'account',
							id:   'ACCOUNT_ID_2'
						}
					}
				]
			});
		});

		it('should callback with comment replies', function() {
			default_article_comments[1].data.children[0].data.replies = {
				kind: 'Listing',
				data: {
					children: [
						{
							kind: 't1',
							data: {
								replies:     '',
								id:          'COMMENT_ID_1_1',
								author:      'ACCOUNT_ID_1_1',
								score:       1100,
								body_html:   '<div class="md"><p>TEXT 1 1</p>\n</div>',
								created_utc: 1440189331
							}
						},
						{
							kind: 't1',
							data: {
								replies:     '',
								id:          'COMMENT_ID_1_2',
								author:      'ACCOUNT_ID_1_2',
								score:       1200,
								body_html:   '<div class="md"><p>TEXT 1 2</p>\n</div>',
								created_utc: 1440189331
							}
						},
						{
							kind: 'more',
							data: {
								count:    2,
								children: ['COMMENT_ID_1_3', 'COMMENT_ID_1_4'],
								id:       'COMMENT_ID_1_3'
							}
						}
					]
				}
			};
			article_comments_endpoint.reply(200, default_article_comments);

			return expect(reddit.discussion({ id: 'CONTENT_ID' })).to.eventually.have.deep.property('comments[0].replies').that.eql([
				{
					api:     'reddit',
					type:    'comment',
					id:      'COMMENT_ID_1_1',
					text:    '<p>TEXT 1 1</p>',
					date:    1440189331000,
					stats:   { score: 1100 },
					account: {
						api:  'reddit',
						type: 'account',
						id:   'ACCOUNT_ID_1_1'
					}
				},
				{
					api:     'reddit',
					type:    'comment',
					id:      'COMMENT_ID_1_2',
					text:    '<p>TEXT 1 2</p>',
					date:    1440189331000,
					stats:   { score: 1200 },
					account: {
						api:  'reddit',
						type: 'account',
						id:   'ACCOUNT_ID_1_2'
					}
				}
			]);
		});

		it('should include urls for link posts', function() {
			delete default_article_comments[0].data.children[0].data.selftext_html;
			default_article_comments[0].data.children[0].data.is_self = false;
			default_article_comments[0].data.children[0].data.url = 'https://www.hovercards.com';
			article_comments_endpoint.reply(200, default_article_comments);

			var promise = reddit.discussion({ id: 'CONTENT_ID' });

			return Promise.all([
				expect(promise).to.eventually.not.have.deep.property('content.text'),
				expect(promise).to.eventually.have.deep.property('content.url', 'https://www.hovercards.com')
			]);
		});

		it('should ignore [deleted] accounts', function() {
			default_article_comments[0].data.children[0].data.author = '[deleted]';
			default_article_comments[1].data.children[0].data.author = '[deleted]';
			default_article_comments[1].data.children[1].data.author = '[deleted]';
			article_comments_endpoint.reply(200, default_article_comments);

			var promise = reddit.discussion({ id: 'CONTENT_ID' });

			return Promise.all([
				expect(promise).to.eventually.not.have.deep.property('content.account'),
				expect(promise).to.eventually.not.have.deep.property('comments[0].account'),
				expect(promise).to.eventually.not.have.deep.property('comments[1].account')
			]);
		});

		describe('article comments endpoint', function() {
			it('should try again on 401', function() {
				article_comments_endpoint.reply(401, '');
				nock('https://www.reddit.com')
					.post('/api/v1/access_token', 'scope=read%2Chistory&grant_type=https%3A%2F%2Foauth.reddit.com%2Fgrants%2Finstalled_client&device_id=DEVICE_ID_1111111111&api_type=json')
					.reply(200, { access_token: 'ACCESS_TOKEN_2', token_type: 'bearer', expires_in: 3600, scope: 'history read' });
				nock('https://oauth.reddit.com')
					.get('/comments/CONTENT_ID')
					.matchHeader('authorization', 'bearer ACCESS_TOKEN_2')
					.query({ limit: config.counts.listed, api_type: 'json' })
					.reply(200, default_article_comments);

				return expect(reddit.discussion({ id: 'CONTENT_ID' })).to.not.be.rejected;
			});

			it('should 404 on 404', function() {
				article_comments_endpoint.reply(404, '');

				return expect(reddit.discussion({ id: 'CONTENT_ID' })).to.be.rejected.and.to.eventually.have.property('status', 404);
			});

			it('should 429 on 429', function() {
				article_comments_endpoint.reply(429, '');

				return expect(reddit.discussion({ id: 'CONTENT_ID' })).to.be.rejected.and.to.eventually.have.property('status', 429);
			});

			it('should 500 on 4xx', function() {
				article_comments_endpoint.reply(478, '');

				var promise = reddit.discussion({ id: 'CONTENT_ID' });

				return Promise.all([
					expect(promise).to.be.rejected.and.to.eventually.have.property('status', 500),
					expect(promise).to.be.rejected.and.to.eventually.have.property('original_status', 478)
				]);
			});

			it('should 502 on 5xx', function() {
				article_comments_endpoint
					.twice()
					.reply(578, '');

				var promise = reddit.discussion({ id: 'CONTENT_ID' });

				return Promise.all([
					expect(promise).to.be.rejected.and.to.eventually.have.property('status', 502),
					expect(promise).to.be.rejected.and.to.eventually.have.property('original_status', 578)
				]);
			});
		});

		describe('for content', function() {
			var search_endpoint;
			var default_search;
			var sandbox;
			var urls;

			beforeEach(function() {
				search_endpoint = nock('https://oauth.reddit.com')
					.get('/search')
					.matchHeader('authorization', 'bearer ACCESS_TOKEN')
					.query({ q: 'url:"www.wenoknow.com" OR url:"www.hovercards.com"', limit: '25', api_type: 'json' });

				sandbox = sinon.sandbox.create();
				urls = require('../urls');
				sandbox.stub(urls, 'represent');
				urls.represent.withArgs({ api: 'someapi', type: 'content', id: 'SOME_CONTENT_ID' }).returns(['https://www.wenoknow.com', 'https://www.hovercards.com']);

				default_search = {
					kind: 'Listing',
					data: {
						children: [
							{
								kind: 't3',
								data: {
									subreddit:    'SUBREDDIT',
									id:           'CONTENT_ID',
									author:       'ACCOUNT_ID',
									score:        1000,
									is_self:      true,
									title:        'TITLE',
									created_utc:  1440189331,
									upvote_ratio: 0.1,
									num_comments: 2000,
									url:          'https://www.wenoknow.com'
								}
							}
						]
					}
				};
			});

			afterEach(function() {
				sandbox.restore();
			});

			it('should callback reddit comments', function() {
				article_comments_endpoint.reply(200, default_article_comments);
				search_endpoint.reply(200, default_search);

				return expect(reddit.discussion({ for: { api: 'someapi', type: 'content', id: 'SOME_CONTENT_ID' } })).to.eventually.eql({
					api:  'reddit',
					type: 'discussion',
					id:   'CONTENT_ID',
					for:  {
						api:  'someapi',
						type: 'content',
						id:   'SOME_CONTENT_ID'
					},
					content: {
						api:       'reddit',
						type:      'content',
						id:        'CONTENT_ID',
						name:      'TITLE',
						date:      1440189331000,
						subreddit: 'SUBREDDIT',
						stats:     {
							score:       1000,
							score_ratio: 0.1,
							comments:    2000
						},
						account: {
							api:  'reddit',
							type: 'account',
							id:   'ACCOUNT_ID'
						}
					},
					comments: [
						{ api:     'reddit',
							type:    'comment',
							id:      'COMMENT_ID_1',
							text:    '<p>TEXT 1</p>',
							date:    1440189331000,
							stats:   { score: 1000 },
							account: {
								api:  'reddit',
								type: 'account',
								id:   'ACCOUNT_ID_1'
							}
						},
						{
							api:     'reddit',
							type:    'comment',
							id:      'COMMENT_ID_2',
							text:    '<p>TEXT 2</p>',
							date:    1440189331000,
							stats:   { score: 2000 },
							account: {
								api:  'reddit',
								type: 'account',
								id:   'ACCOUNT_ID_2'
							}
						}
					]
				});
			});

			it('should callback for post with most comments', function() {
				default_search.data.children[1] = default_search.data.children[0];
				default_search.data.children[0] = {
					kind: 't3',
					data: {
						subreddit:    'SUBREDDIT',
						id:           'CONTENT_ID_2',
						author:       'ACCOUNT_ID',
						score:        1000,
						is_self:      true,
						title:        'TITLE',
						created_utc:  1440189331,
						upvote_ratio: 0.1,
						num_comments: 1999,
						url:          'https://www.hovercards.com'
					}
				};
				article_comments_endpoint.reply(200, default_article_comments);
				search_endpoint.reply(200, default_search);

				return expect(reddit.discussion({ for: { api: 'someapi', type: 'content', id: 'SOME_CONTENT_ID' } })).to.eventually.have.property('id', 'CONTENT_ID');
			});

			describe('search endpoint', function() {
				beforeEach(function() {
					article_comments_endpoint.reply(200, default_article_comments);
				});

				it('should try again on 401', function() {
					search_endpoint.reply(401, '');
					nock('https://www.reddit.com')
						.post('/api/v1/access_token', 'scope=read%2Chistory&grant_type=https%3A%2F%2Foauth.reddit.com%2Fgrants%2Finstalled_client&device_id=DEVICE_ID_1111111111&api_type=json')
						.reply(200, { access_token: 'ACCESS_TOKEN_2', token_type: 'bearer', expires_in: 3600, scope: 'history read' });
					nock('https://oauth.reddit.com')
						.get('/search')
						.matchHeader('authorization', 'bearer ACCESS_TOKEN_2')
						.query({ q: 'url:"www.wenoknow.com" OR url:"www.hovercards.com"', limit: '25', api_type: 'json' })
						.reply(200, default_search);
					nock('https://oauth.reddit.com')
						.get('/comments/CONTENT_ID')
						.matchHeader('authorization', 'bearer ACCESS_TOKEN_2')
						.query({ limit: config.counts.listed, api_type: 'json' })
						.reply(200, default_article_comments);

					return expect(reddit.discussion({ for: { api: 'someapi', type: 'content', id: 'SOME_CONTENT_ID' } })).to.not.be.rejected;
				});

				it('should 404 on 404', function() {
					search_endpoint.reply(404, '');

					return expect(reddit.discussion({ for: { api: 'someapi', type: 'content', id: 'SOME_CONTENT_ID' } })).to.be.rejected.and.to.eventually.have.property('status', 404);
				});

				it('should 429 on 429', function() {
					search_endpoint.reply(429, '');

					return expect(reddit.discussion({ for: { api: 'someapi', type: 'content', id: 'SOME_CONTENT_ID' } })).to.be.rejected.and.to.eventually.have.property('status', 429);
				});

				it('should 500 on 4xx', function() {
					search_endpoint.reply(478, '');

					var promise = reddit.discussion({ for: { api: 'someapi', type: 'content', id: 'SOME_CONTENT_ID' } });

					return Promise.all([
						expect(promise).to.be.rejected.and.to.eventually.have.property('status', 500),
						expect(promise).to.be.rejected.and.to.eventually.have.property('original_status', 478)
					]);
				});

				it('should 502 on 5xx', function() {
					search_endpoint
						.twice()
						.reply(578, '');

					var promise = reddit.discussion({ for: { api: 'someapi', type: 'content', id: 'SOME_CONTENT_ID' } });

					return Promise.all([
						expect(promise).to.be.rejected.and.to.eventually.have.property('status', 502),
						expect(promise).to.be.rejected.and.to.eventually.have.property('original_status', 578)
					]);
				});
			});
		});
	});

	describe('.account', function() {
		var user_about_endpoint;
		var default_user_about;

		beforeEach(function() {
			user_about_endpoint = nock('https://oauth.reddit.com')
				.get('/user/ACCOUNT_ID/about')
				.matchHeader('authorization', 'bearer ACCESS_TOKEN')
				.query({ api_type: 'json' });

			default_user_about = {
				kind: 't2',
				data: {
					name:          'ACCOUNT_ID',
					created_utc:   1364602081,
					link_karma:    1000,
					comment_karma: 2000
				}
			};
		});

		it('should callback reddit user', function() {
			user_about_endpoint.reply(200, default_user_about);

			return expect(reddit.account({ id: 'ACCOUNT_ID' })).to.eventually.eql({
				api:   'reddit',
				type:  'account',
				id:    'ACCOUNT_ID',
				date:  1364602081000,
				stats: {
					link_karma:    1000,
					comment_karma: 2000
				}
			});
		});

		describe('user about endpoint', function() {
			it('should try again on 401', function() {
				user_about_endpoint.reply(401, '');
				nock('https://www.reddit.com')
					.post('/api/v1/access_token', 'scope=read%2Chistory&grant_type=https%3A%2F%2Foauth.reddit.com%2Fgrants%2Finstalled_client&device_id=DEVICE_ID_1111111111&api_type=json')
					.reply(200, { access_token: 'ACCESS_TOKEN_2', token_type: 'bearer', expires_in: 3600, scope: 'history read' });
				nock('https://oauth.reddit.com')
					.get('/user/ACCOUNT_ID/about')
					.matchHeader('authorization', 'bearer ACCESS_TOKEN_2')
					.query({ api_type: 'json' })
					.reply(200, default_user_about);

				return expect(reddit.account({ id: 'ACCOUNT_ID' })).to.not.be.rejected;
			});

			it('should 404 on 404', function() {
				user_about_endpoint.reply(404, '');

				return expect(reddit.account({ id: 'ACCOUNT_ID' })).to.be.rejected.and.to.eventually.have.property('status', 404);
			});

			it('should 429 on 429', function() {
				user_about_endpoint.reply(429, '');

				return expect(reddit.account({ id: 'ACCOUNT_ID' })).to.be.rejected.and.to.eventually.have.property('status', 429);
			});

			it('should 500 on 4xx', function() {
				user_about_endpoint.reply(478, '');

				var promise = reddit.account({ id: 'ACCOUNT_ID' });

				return Promise.all([
					expect(promise).to.be.rejected.and.to.eventually.have.property('status', 500),
					expect(promise).to.be.rejected.and.to.eventually.have.property('original_status', 478)
				]);
			});

			it('should 502 on 5xx', function() {
				user_about_endpoint
					.twice()
					.reply(578, '');

				var promise = reddit.account({ id: 'ACCOUNT_ID' });

				return Promise.all([
					expect(promise).to.be.rejected.and.to.eventually.have.property('status', 502),
					expect(promise).to.be.rejected.and.to.eventually.have.property('original_status', 578)
				]);
			});
		});
	});
});
