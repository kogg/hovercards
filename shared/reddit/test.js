var config    = require('../config');
var chai      = require('chai');
var nock      = require('nock');
var sinon     = require('sinon');
var sinonChai = require('sinon-chai');
var expect    = chai.expect;
chai.use(sinonChai);

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

			default_article_comments = [{ kind: 'Listing',
			                              data: { children: [{ kind: 't3',
			                                                   data: { subreddit:     'SUBREDDIT',
			                                                           selftext_html: '<div class="md"><p>TEXT</p>\n</div>',
			                                                           id:            'CONTENT_ID',
			                                                           author:        'ACCOUNT_ID',
			                                                           score:         1000,
			                                                           is_self:       true,
			                                                           title:         'TITLE',
			                                                           created_utc:   1440189331,
			                                                           upvote_ratio:  0.1,
			                                                           num_comments: 2000 } }] } },
			                            { kind: 'Listing', data: { children: [] } }];
		});

		it('should callback reddit post', function(done) {
			article_comments_endpoint.reply(200, default_article_comments);

			reddit.content({ id: 'CONTENT_ID' }, function(err, content) {
				expect(err).not.to.exist;
				expect(content).to.eql({ api:       'reddit',
				                         type:      'content',
				                         id:        'CONTENT_ID',
				                         name:      'TITLE',
				                         text:      '<p>TEXT</p>',
				                         date:      1440189331000,
				                         subreddit: 'SUBREDDIT',
				                         stats:     { score:       1000,
				                                      score_ratio: 0.1,
				                                      comments:    2000 },
				                         account:   { api:  'reddit',
				                                      type: 'account',
				                                      id:   'ACCOUNT_ID' } });
				done();
			});
		});

		it('should include urls for link posts', function(done) {
			delete default_article_comments[0].data.children[0].data.selftext_html;
			default_article_comments[0].data.children[0].data.is_self = false;
			default_article_comments[0].data.children[0].data.url     = 'https://www.hovercards.com';
			article_comments_endpoint.reply(200, default_article_comments);

			reddit.content({ id: 'CONTENT_ID' }, function(err, content) {
				expect(err).not.to.exist;
				expect(content).not.to.have.property('text');
				expect(content).to.have.property('url', 'https://www.hovercards.com');
				done();
			});
		});

		it('should ignore [deleted] accounts', function(done) {
			default_article_comments[0].data.children[0].data.author = '[deleted]';
			article_comments_endpoint.reply(200, default_article_comments);

			reddit.content({ id: 'CONTENT_ID' }, function(err, content) {
				expect(err).not.to.exist;
				expect(content).not.to.have.property('account');
				done();
			});
		});

		describe('usage', function() {
			it('should report', function(done) {
				article_comments_endpoint.reply(200, default_article_comments);

				reddit.content({ id: 'CONTENT_ID' }, function(err, content, usage) {
					expect(usage).to.have.property('reddit-requests', 1);
					done();
				});
			});
		});

		describe('article comments endpoint', function() {
			it('should try again on 401', function(done) {
				article_comments_endpoint.reply(401, '');
				nock('https://www.reddit.com')
					.post('/api/v1/access_token', 'scope=read%2Chistory&grant_type=https%3A%2F%2Foauth.reddit.com%2Fgrants%2Finstalled_client&device_id=DEVICE_ID_1111111111&api_type=json')
					.reply(200, { access_token: 'ACCESS_TOKEN_2', token_type: 'bearer', expires_in: 3600, scope: 'history read' });
				nock('https://oauth.reddit.com')
					.get('/comments/CONTENT_ID')
					.matchHeader('authorization', 'bearer ACCESS_TOKEN_2')
					.query({ limit: config.counts.listed, api_type: 'json' })
					.reply(200, default_article_comments);

				reddit.content({ id: 'CONTENT_ID' }, function(err, content) {
					expect(err).not.to.be.ok;
					expect(content).to.be.ok;
					done();
				});
			});

			it('should 404 on 404', function(done) {
				article_comments_endpoint.reply(404, '');

				reddit.content({ id: 'CONTENT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Reddit Article Comments', status: 404 });
					done();
				});
			});

			it('should 429 on 429', function(done) {
				article_comments_endpoint.reply(429, '');

				reddit.content({ id: 'CONTENT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Reddit Article Comments', status: 429 });
					done();
				});
			});

			it('should 500 on 4xx', function(done) {
				article_comments_endpoint.reply(478, '');

				reddit.content({ id: 'CONTENT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Reddit Article Comments', status: 500, original_status: 478 });
					done();
				});
			});

			it('should 502 on 5xx', function(done) {
				article_comments_endpoint
					.twice()
					.reply(578, '');

				reddit.content({ id: 'CONTENT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Reddit Article Comments', status: 502, original_status: 578 });
					done();
				});
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

			default_article_comments = [{ kind: 'Listing',
			                              data: { children: [{ kind: 't3',
			                                                   data: { subreddit:    'SUBREDDIT',
			                                                           id:           'CONTENT_ID',
			                                                           author:       'ACCOUNT_ID',
			                                                           score:        1000,
			                                                           is_self:      true,
			                                                           title:        'TITLE',
			                                                           created_utc:  1440189331,
			                                                           upvote_ratio: 0.1,
			                                                           num_comments: 2000 } }] } },
			                            { kind: 'Listing',
			                              data: { children: [{ kind: 't1',
			                                                   data: { replies:     '',
			                                                           id:          'COMMENT_ID_1',
			                                                           author:      'ACCOUNT_ID_1',
			                                                           score:       1000,
			                                                           body_html:   '<div class="md"><p>TEXT 1</p>\n</div>',
			                                                           created_utc: 1440189331 } },
			                                                 { kind: 't1',
			                                                   data: { replies:     '',
			                                                           id:          'COMMENT_ID_2',
			                                                           author:      'ACCOUNT_ID_2',
			                                                           score:       2000,
			                                                           body_html:   '<div class="md"><p>TEXT 2</p>\n</div>',
			                                                           created_utc: 1440189331 } },
			                                                 { kind: 'more',
			                                                   data: { count:    2,
			                                                           children: ['COMMENT_ID_3', 'COMMENT_ID_4'],
			                                                           id:       'COMMENT_ID_3' } }] } }];
		});

		it('should callback reddit comments', function(done) {
			article_comments_endpoint.reply(200, default_article_comments);

			reddit.discussion({ id: 'CONTENT_ID' }, function(err, discussion) {
				expect(err).not.to.exist;
				expect(discussion).to.eql({ api:       'reddit',
				                            type:      'discussion',
				                            id:        'CONTENT_ID',
				                            content:   { api:       'reddit',
				                                         type:      'content',
				                                         id:        'CONTENT_ID',
				                                         name:      'TITLE',
				                                         date:      1440189331000,
				                                         subreddit: 'SUBREDDIT',
				                                         stats:     { score:       1000,
				                                                      score_ratio: 0.1,
				                                                      comments:    2000 },
				                                         account:   { api:  'reddit',
				                                                      type: 'account',
				                                                      id:   'ACCOUNT_ID' } },
				                            comments:  [{ api:     'reddit',
				                                          type:    'comment',
				                                          id:      'COMMENT_ID_1',
				                                          text:    '<p>TEXT 1</p>',
				                                          date:    1440189331000,
				                                          stats:   { score: 1000 },
				                                          account: { api:  'reddit',
				                                                     type: 'account',
				                                                     id:   'ACCOUNT_ID_1' } },
				                                        { api:     'reddit',
				                                          type:    'comment',
				                                          id:      'COMMENT_ID_2',
				                                          text:    '<p>TEXT 2</p>',
				                                          date:    1440189331000,
				                                          stats:   { score: 2000 },
				                                          account: { api:  'reddit',
				                                                     type: 'account',
				                                                     id:   'ACCOUNT_ID_2' } }] });
				done();
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

				default_search = { kind: 'Listing',
				                   data: { children: [{ kind: 't3',
				                                        data: { subreddit:    'SUBREDDIT',
				                                                id:           'CONTENT_ID',
				                                                author:       'ACCOUNT_ID',
				                                                score:        1000,
				                                                is_self:      true,
				                                                title:        'TITLE',
				                                                created_utc:  1440189331,
				                                                upvote_ratio: 0.1,
				                                                num_comments: 2000,
				                                                url:          'https://www.wenoknow.com' } }] } };
			});

			afterEach(function() {
				sandbox.restore();
			});

			it('should callback reddit comments', function(done) {
				article_comments_endpoint.reply(200, default_article_comments);
				search_endpoint.reply(200, default_search);

				reddit.discussion({ for: { api: 'someapi', type: 'content', id: 'SOME_CONTENT_ID' } }, function(err, discussion) {
					expect(err).not.to.exist;
					expect(discussion).to.eql({ api:       'reddit',
					                            type:      'discussion',
					                            id:        'CONTENT_ID',
					                            content:   { api:       'reddit',
					                                         type:      'content',
					                                         id:        'CONTENT_ID',
					                                         name:      'TITLE',
					                                         date:      1440189331000,
					                                         subreddit: 'SUBREDDIT',
					                                         stats:     { score:       1000,
					                                                      score_ratio: 0.1,
					                                                      comments:    2000 },
					                                         account:   { api:  'reddit',
					                                                      type: 'account',
					                                                      id:   'ACCOUNT_ID' } },
					                            comments:  [{ api:     'reddit',
					                                          type:    'comment',
					                                          id:      'COMMENT_ID_1',
					                                          text:    '<p>TEXT 1</p>',
					                                          date:    1440189331000,
					                                          stats:   { score: 1000 },
					                                          account: { api:  'reddit',
					                                                     type: 'account',
					                                                     id:   'ACCOUNT_ID_1' } },
					                                        { api:     'reddit',
					                                          type:    'comment',
					                                          id:      'COMMENT_ID_2',
					                                          text:    '<p>TEXT 2</p>',
					                                          date:    1440189331000,
					                                          stats:   { score: 2000 },
					                                          account: { api:  'reddit',
					                                                     type: 'account',
					                                                     id:   'ACCOUNT_ID_2' } }] });
					done();
				});
			});

			it('should callback for post with most comments', function(done) {
				default_search.data.children[1] = default_search.data.children[0];
				default_search.data.children[0] = { kind: 't3',
				                                    data: { subreddit:    'SUBREDDIT',
				                                            id:           'CONTENT_ID_2',
				                                            author:       'ACCOUNT_ID',
				                                            score:        1000,
				                                            is_self:      true,
				                                            title:        'TITLE',
				                                            created_utc:  1440189331,
				                                            upvote_ratio: 0.1,
				                                            num_comments: 1999,
				                                            url:          'https://www.hovercards.com' } };
				article_comments_endpoint.reply(200, default_article_comments);
				search_endpoint.reply(200, default_search);

				reddit.discussion({ for: { api: 'someapi', type: 'content', id: 'SOME_CONTENT_ID' } }, function(err, discussion) {
					expect(err).not.to.exist;
					expect(discussion).to.have.property('id', 'CONTENT_ID');
					done();
				});
			});

			describe('usage', function() {
				it('should report', function(done) {
					article_comments_endpoint.reply(200, default_article_comments);
					search_endpoint.reply(200, default_search);

					reddit.discussion({ for: { api: 'someapi', type: 'content', id: 'SOME_CONTENT_ID' } }, function(err, discussion, usage) {
						expect(usage).to.have.property('reddit-requests', 2);
						done();
					});
				});
			});

			describe('search endpoint', function() {
				beforeEach(function() {
					article_comments_endpoint.reply(200, default_article_comments);
				});

				it('should try again on 401', function(done) {
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

					reddit.discussion({ for: { api: 'someapi', type: 'content', id: 'SOME_CONTENT_ID' } }, function(err, discussion) {
						expect(err).not.to.be.ok;
						expect(discussion).to.be.ok;
						done();
					});
				});

				it('should 404 on 404', function(done) {
					search_endpoint.reply(404, '');

					reddit.discussion({ for: { api: 'someapi', type: 'content', id: 'SOME_CONTENT_ID' } }, function(err) {
						expect(err).to.eql({ message: 'Reddit Search', status: 404 });
						done();
					});
				});

				it('should 429 on 429', function(done) {
					search_endpoint.reply(429, '');

					reddit.discussion({ for: { api: 'someapi', type: 'content', id: 'SOME_CONTENT_ID' } }, function(err) {
						expect(err).to.eql({ message: 'Reddit Search', status: 429 });
						done();
					});
				});

				it('should 500 on 4xx', function(done) {
					search_endpoint.reply(478, '');

					reddit.discussion({ for: { api: 'someapi', type: 'content', id: 'SOME_CONTENT_ID' } }, function(err) {
						expect(err).to.eql({ message: 'Reddit Search', status: 500, original_status: 478 });
						done();
					});
				});

				it('should 502 on 5xx', function(done) {
					search_endpoint
						.twice()
						.reply(578, '');

					reddit.discussion({ for: { api: 'someapi', type: 'content', id: 'SOME_CONTENT_ID' } }, function(err) {
						expect(err).to.eql({ message: 'Reddit Search', status: 502, original_status: 578 });
						done();
					});
				});
			});
		});

		it('should callback with comment replies', function(done) {
			default_article_comments[1].data.children[0].data.replies = { kind: 'Listing',
			                                                              data: { children: [{ kind: 't1',
			                                                                                   data: { replies:     '',
			                                                                                           id:          'COMMENT_ID_1_1',
			                                                                                           author:      'ACCOUNT_ID_1_1',
			                                                                                           score:       1100,
			                                                                                           body_html:   '<div class="md"><p>TEXT 1 1</p>\n</div>',
			                                                                                           created_utc: 1440189331 } },
			                                                                                 { kind: 't1',
			                                                                                   data: { replies:     '',
			                                                                                           id:          'COMMENT_ID_1_2',
			                                                                                           author:      'ACCOUNT_ID_1_2',
			                                                                                           score:       1200,
			                                                                                           body_html:   '<div class="md"><p>TEXT 1 2</p>\n</div>',
			                                                                                           created_utc: 1440189331 } },
			                                                                                 { kind: 'more',
			                                                                                   data: { count:    2,
			                                                                                           children: ['COMMENT_ID_1_3', 'COMMENT_ID_1_4'],
			                                                                                           id:       'COMMENT_ID_1_3' } }] } };
			article_comments_endpoint.reply(200, default_article_comments);

			reddit.discussion({ id: 'CONTENT_ID' }, function(err, discussion) {
				expect(err).not.to.exist;
				expect(discussion).to.have.deep.property('comments[0].replies').that.eql([{ api:     'reddit',
				                                                                            type:    'comment',
				                                                                            id:      'COMMENT_ID_1_1',
				                                                                            text:    '<p>TEXT 1 1</p>',
				                                                                            date:    1440189331000,
				                                                                            stats:   { score: 1100 },
				                                                                            account: { api:  'reddit',
				                                                                                       type: 'account',
				                                                                                       id:   'ACCOUNT_ID_1_1' } },
				                                                                          { api:     'reddit',
				                                                                            type:    'comment',
				                                                                            id:      'COMMENT_ID_1_2',
				                                                                            text:    '<p>TEXT 1 2</p>',
				                                                                            date:    1440189331000,
				                                                                            stats:   { score: 1200 },
				                                                                            account: { api:  'reddit',
				                                                                                       type: 'account',
				                                                                                       id:   'ACCOUNT_ID_1_2' } }]);
				done();
			});
		});

		it('should include urls for link posts', function(done) {
			delete default_article_comments[0].data.children[0].data.selftext_html;
			default_article_comments[0].data.children[0].data.is_self = false;
			default_article_comments[0].data.children[0].data.url     = 'https://www.hovercards.com';
			article_comments_endpoint.reply(200, default_article_comments);

			reddit.discussion({ id: 'CONTENT_ID' }, function(err, discussion) {
				expect(err).not.to.exist;
				expect(discussion).not.to.have.deep.property('content.text');
				expect(discussion).to.have.deep.property('content.url', 'https://www.hovercards.com');
				done();
			});
		});

		it('should ignore [deleted] accounts', function(done) {
			default_article_comments[0].data.children[0].data.author = '[deleted]';
			default_article_comments[1].data.children[0].data.author = '[deleted]';
			default_article_comments[1].data.children[1].data.author = '[deleted]';
			article_comments_endpoint.reply(200, default_article_comments);

			reddit.discussion({ id: 'CONTENT_ID' }, function(err, discussion) {
				expect(err).not.to.exist;
				expect(discussion).not.to.have.deep.property('content.account');
				expect(discussion).not.to.have.deep.property('comments[0].account');
				expect(discussion).not.to.have.deep.property('comments[1].account');
				done();
			});
		});

		describe('usage', function() {
			it('should report', function(done) {
				article_comments_endpoint.reply(200, default_article_comments);

				reddit.discussion({ id: 'CONTENT_ID' }, function(err, discussion, usage) {
					expect(usage).to.have.property('reddit-requests', 1);
					done();
				});
			});
		});

		describe('article comments endpoint', function() {
			it('should try again on 401', function(done) {
				article_comments_endpoint.reply(401, '');
				nock('https://www.reddit.com')
					.post('/api/v1/access_token', 'scope=read%2Chistory&grant_type=https%3A%2F%2Foauth.reddit.com%2Fgrants%2Finstalled_client&device_id=DEVICE_ID_1111111111&api_type=json')
					.reply(200, { access_token: 'ACCESS_TOKEN_2', token_type: 'bearer', expires_in: 3600, scope: 'history read' });
				nock('https://oauth.reddit.com')
					.get('/comments/CONTENT_ID')
					.matchHeader('authorization', 'bearer ACCESS_TOKEN_2')
					.query({ limit: config.counts.listed, api_type: 'json' })
					.reply(200, default_article_comments);

				reddit.discussion({ id: 'CONTENT_ID' }, function(err, discussion) {
					expect(err).not.to.be.ok;
					expect(discussion).to.be.ok;
					done();
				});
			});

			it('should 404 on 404', function(done) {
				article_comments_endpoint.reply(404, '');

				reddit.discussion({ id: 'CONTENT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Reddit Article Comments', status: 404 });
					done();
				});
			});

			it('should 429 on 429', function(done) {
				article_comments_endpoint.reply(429, '');

				reddit.discussion({ id: 'CONTENT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Reddit Article Comments', status: 429 });
					done();
				});
			});

			it('should 500 on 4xx', function(done) {
				article_comments_endpoint.reply(478, '');

				reddit.discussion({ id: 'CONTENT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Reddit Article Comments', status: 500, original_status: 478 });
					done();
				});
			});

			it('should 502 on 5xx', function(done) {
				article_comments_endpoint
					.twice()
					.reply(578, '');

				reddit.discussion({ id: 'CONTENT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Reddit Article Comments', status: 502, original_status: 578 });
					done();
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

			default_user_about = { kind: 't2',
			                       data: { name:          'ACCOUNT_ID',
			                               created_utc:   1364602081,
			                               link_karma:    1000,
			                               comment_karma: 2000 } };
		});

		it('should callback reddit user', function(done) {
			user_about_endpoint.reply(200, default_user_about);

			reddit.account({ id: 'ACCOUNT_ID' }, function(err, account) {
				expect(err).not.to.exist;
				expect(account).to.eql({ api:   'reddit',
				                         type:  'account',
				                         id:    'ACCOUNT_ID',
				                         date:  1364602081000,
				                         stats: { link_karma:    1000,
				                                  comment_karma: 2000 } });
				done();
			});
		});

		describe('usage', function() {
			it('should report', function(done) {
				user_about_endpoint.reply(200, default_user_about);

				reddit.account({ id: 'ACCOUNT_ID' }, function(err, account, usage) {
					expect(usage).to.have.property('reddit-requests', 1);
					done();
				});
			});
		});

		describe('user about endpoint', function() {
			it('should try again on 401', function(done) {
				user_about_endpoint.reply(401, '');
				nock('https://www.reddit.com')
					.post('/api/v1/access_token', 'scope=read%2Chistory&grant_type=https%3A%2F%2Foauth.reddit.com%2Fgrants%2Finstalled_client&device_id=DEVICE_ID_1111111111&api_type=json')
					.reply(200, { access_token: 'ACCESS_TOKEN_2', token_type: 'bearer', expires_in: 3600, scope: 'history read' });
				nock('https://oauth.reddit.com')
					.get('/user/ACCOUNT_ID/about')
					.matchHeader('authorization', 'bearer ACCESS_TOKEN_2')
					.query({ api_type: 'json' })
					.reply(200, default_user_about);

				reddit.account({ id: 'ACCOUNT_ID' }, function(err, account) {
					expect(err).not.to.be.ok;
					expect(account).to.be.ok;
					done();
				});
			});

			it('should 404 on 404', function(done) {
				user_about_endpoint.reply(404, '');

				reddit.account({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Reddit User About', status: 404 });
					done();
				});
			});

			it('should 429 on 429', function(done) {
				user_about_endpoint.reply(429, '');

				reddit.account({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Reddit User About', status: 429 });
					done();
				});
			});

			it('should 500 on 4xx', function(done) {
				user_about_endpoint.reply(478, '');

				reddit.account({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Reddit User About', status: 500, original_status: 478 });
					done();
				});
			});

			it('should 502 on 5xx', function(done) {
				user_about_endpoint
					.twice()
					.reply(578, '');

				reddit.account({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Reddit User About', status: 502, original_status: 578 });
					done();
				});
			});
		});
	});

	describe('.account_content', function() {
		var user_overview_endpoint;
		var default_user_overview;

		beforeEach(function() {
			user_overview_endpoint = nock('https://oauth.reddit.com')
				.get('/user/ACCOUNT_ID/overview')
				.matchHeader('authorization', 'bearer ACCESS_TOKEN')
				.query({ limit: config.counts.listed, api_type: 'json' });

			default_user_overview = { kind: 'Listing',
			                          data: { children: [{ kind: 't3',
			                                               data: { subreddit:     'SUBREDDIT_1',
			                                                       selftext_html: '<div class="md"><p>TEXT 1</p>\n</div>',
			                                                       id:            'CONTENT_ID_1',
			                                                       score:         1000,
			                                                       is_self:       true,
			                                                       title:         'TITLE 1',
			                                                       created_utc:   1440189331 } },
			                                             { kind: 't1',
			                                               data: { link_title:  'TITLE 2',
			                                                       link_id:     't3_CONTENT_ID_2',
			                                                       link_author: 'ACCOUNT_ID_2',
			                                                       score:       2000,
			                                                       id:          'COMMENT_ID_2',
			                                                       body_html:   '<div class="md"><p>TEXT 2</p>\n</div>',
			                                                       subreddit:   'SUBREDDIT_2',
			                                                       link_url:    'https://www.reddit.com/r/SUBREDDIT_2/comments/CONTENT_ID_2/TITLE_2/',
			                                                       created_utc: 1440189331 } }] } };
		});

		it('should callback posts and comments', function(done) {
			user_overview_endpoint.reply(200, default_user_overview);

			reddit.account_content({ id: 'ACCOUNT_ID' }, function(err, account_content) {
				expect(err).not.to.exist;
				expect(account_content).to.eql({ api:     'reddit',
				                                 type:    'account_content',
				                                 id:      'ACCOUNT_ID',
				                                 content: [{ api:       'reddit',
				                                             type:      'content',
				                                             id:        'CONTENT_ID_1',
				                                             name:      'TITLE 1',
				                                             date:      1440189331000,
				                                             subreddit: 'SUBREDDIT_1',
				                                             stats:     { score: 1000 } },
				                                           { api:     'reddit',
				                                             type:    'comment',
				                                             id:      'COMMENT_ID_2',
				                                             text:    '<p>TEXT 2</p>',
				                                             date:    1440189331000,
				                                             stats:   { score: 2000 },
				                                             content: { api:       'reddit',
				                                                        type:      'content',
				                                                        id:        'CONTENT_ID_2',
				                                                        name:      'TITLE 2',
				                                                        subreddit: 'SUBREDDIT_2',
				                                                        account:   { api:  'reddit',
				                                                                     type: 'account',
				                                                                     id:   'ACCOUNT_ID_2' } } }] });
				done();
			});
		});

		it('should include urls for link posts', function(done) {
			delete default_user_overview.data.children[0].data.selftext_html;
			default_user_overview.data.children[0].data.is_self = false;
			default_user_overview.data.children[0].data.url     = 'https://www.hovercards.com';
			default_user_overview.data.children[1].data.link_url = 'https://www.wenoknow.com';
			user_overview_endpoint.reply(200, default_user_overview);

			reddit.account_content({ id: 'ACCOUNT_ID' }, function(err, account_content) {
				expect(err).not.to.exist;
				expect(account_content).not.to.have.deep.property('content[0].text');
				expect(account_content).to.have.deep.property('content[0].url', 'https://www.hovercards.com');
				expect(account_content).to.have.deep.property('content[1].content.url', 'https://www.wenoknow.com');
				done();
			});
		});

		it('should ignore [deleted] accounts', function(done) {
			default_user_overview.data.children[1].data.link_author = '[deleted]';
			user_overview_endpoint.reply(200, default_user_overview);

			reddit.account_content({ id: 'ACCOUNT_ID' }, function(err, account_content) {
				expect(err).not.to.exist;
				expect(account_content).not.to.have.deep.property('content[1].content.account');
				done();
			});
		});

		describe('usage', function() {
			it('should report', function(done) {
				user_overview_endpoint.reply(200, default_user_overview);

				reddit.account_content({ id: 'ACCOUNT_ID' }, function(err, account_content, usage) {
					expect(usage).to.have.property('reddit-requests', 1);
					done();
				});
			});
		});

		describe('user overview endpoint', function() {
			it('should try again on 401', function(done) {
				user_overview_endpoint.reply(401, '');
				nock('https://www.reddit.com')
					.post('/api/v1/access_token', 'scope=read%2Chistory&grant_type=https%3A%2F%2Foauth.reddit.com%2Fgrants%2Finstalled_client&device_id=DEVICE_ID_1111111111&api_type=json')
					.reply(200, { access_token: 'ACCESS_TOKEN_2', token_type: 'bearer', expires_in: 3600, scope: 'history read' });
				nock('https://oauth.reddit.com')
					.get('/user/ACCOUNT_ID/overview')
					.matchHeader('authorization', 'bearer ACCESS_TOKEN_2')
					.query({ limit: config.counts.listed, api_type: 'json' })
					.reply(200, default_user_overview);

				reddit.account_content({ id: 'ACCOUNT_ID' }, function(err, account_content) {
					expect(err).not.to.be.ok;
					expect(account_content).to.be.ok;
					done();
				});
			});

			it('should 404 on 404', function(done) {
				user_overview_endpoint.reply(404, '');

				reddit.account_content({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Reddit User Overview', status: 404 });
					done();
				});
			});

			it('should 429 on 429', function(done) {
				user_overview_endpoint.reply(429, '');

				reddit.account_content({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Reddit User Overview', status: 429 });
					done();
				});
			});

			it('should 500 on 4xx', function(done) {
				user_overview_endpoint.reply(478, '');

				reddit.account_content({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Reddit User Overview', status: 500, original_status: 478 });
					done();
				});
			});

			it('should 502 on 5xx', function(done) {
				user_overview_endpoint
					.twice()
					.reply(578, '');

				reddit.account_content({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Reddit User Overview', status: 502, original_status: 578 });
					done();
				});
			});
		});
	});
});

describe('reddit urls', function() {
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
			it('from reddit.com/CONTENT_ID', function() {
				expect(urls.parse(url.parse('https://www.reddit.com/CONTENT_ID', true, true)))
					.to.eql({ api: 'reddit', type: 'content', id: 'CONTENT_ID' });
			});

			it('from reddit.com/comments/CONTENT_ID', function() {
				expect(urls.parse(url.parse('https://www.reddit.com/comments/CONTENT_ID', true, true)))
					.to.eql({ api: 'reddit', type: 'content', id: 'CONTENT_ID' });
			});

			it('from reddit.com/comments/CONTENT_ID/discussion_name', function() {
				expect(urls.parse(url.parse('https://www.reddit.com/comments/CONTENT_ID/discussion_name', true, true)))
					.to.eql({ api: 'reddit', type: 'content', id: 'CONTENT_ID' });
			});

			it('from reddit.com/r/SUBREDDIT/CONTENT_ID', function() {
				expect(urls.parse(url.parse('https://www.reddit.com/r/SUBREDDIT/CONTENT_ID', true, true)))
					.to.eql({ api: 'reddit', type: 'content', id: 'CONTENT_ID', subreddit: 'SUBREDDIT' });
			});

			it('from reddit.com/r/SUBREDDIT/comments/CONTENT_ID', function() {
				expect(urls.parse(url.parse('https://www.reddit.com/r/SUBREDDIT/comments/CONTENT_ID', true, true)))
					.to.eql({ api: 'reddit', type: 'content', id: 'CONTENT_ID', subreddit: 'SUBREDDIT' });
			});

			it('from reddit.com/r/SUBREDDIT/comments/CONTENT_ID/discussion_name', function() {
				expect(urls.parse(url.parse('https://www.reddit.com/r/SUBREDDIT/comments/CONTENT_ID/discussion_name', true, true)))
					.to.eql({ api: 'reddit', type: 'content', id: 'CONTENT_ID', subreddit: 'SUBREDDIT' });
			});

			it('from reddit.com/r/SUBREDDIT/comments/CONTENT_ID/discussion_name/COMMENT_ID', function() {
				expect(urls.parse(url.parse('https://www.reddit.com/r/SUBREDDIT/comments/CONTENT_ID/discussion_name/COMMENT_ID', true, true)))
					.to.eql({ api: 'reddit', type: 'content', id: 'CONTENT_ID', subreddit: 'SUBREDDIT' });
			});

			it('not from reddit.com/r/SUBREDDIT', function() {
				expect(urls.parse(url.parse('https://www.reddit.com/r/SUBREDDIT', true, true))).not.to.be.ok;
			});

			it('not from reddit.com/ads', function() {
				expect(urls.parse(url.parse('https://www.reddit.com/ads', true, true))).not.to.be.ok;
			});

			it('not from reddit.com/advertising', function() {
				expect(urls.parse(url.parse('https://www.reddit.com/advertising', true, true))).not.to.be.ok;
			});

			it('not from reddit.com/blog', function() {
				expect(urls.parse(url.parse('https://www.reddit.com/blog', true, true))).not.to.be.ok;
			});

			it('not from reddit.com/buttons', function() {
				expect(urls.parse(url.parse('https://www.reddit.com/buttons', true, true))).not.to.be.ok;
			});

			it('not from reddit.com/code', function() {
				expect(urls.parse(url.parse('https://www.reddit.com/code', true, true))).not.to.be.ok;
			});

			it('not from reddit.com/contact', function() {
				expect(urls.parse(url.parse('https://www.reddit.com/contact', true, true))).not.to.be.ok;
			});

			it('not from reddit.com/controversial', function() {
				expect(urls.parse(url.parse('https://www.reddit.com/controversial', true, true))).not.to.be.ok;
			});

			it('not from reddit.com/domain', function() {
				expect(urls.parse(url.parse('https://www.reddit.com/domain', true, true))).not.to.be.ok;
			});

			it('not from reddit.com/domain/*', function() {
				expect(urls.parse(url.parse('https://www.reddit.com/domain/i.imgur.com', true, true))).not.to.be.ok;
			});

			it('not from reddit.com/gilded', function() {
				expect(urls.parse(url.parse('https://www.reddit.com/gilded', true, true))).not.to.be.ok;
			});

			it('not from reddit.com/gold', function() {
				expect(urls.parse(url.parse('https://www.reddit.com/gold', true, true))).not.to.be.ok;
			});

			it('not from reddit.com/gold/*', function() {
				expect(urls.parse(url.parse('https://www.reddit.com/gold/about', true, true))).not.to.be.ok;
			});

			it('not from reddit.com/help', function() {
				expect(urls.parse(url.parse('https://www.reddit.com/help', true, true))).not.to.be.ok;
			});

			it('not from reddit.com/help/*', function() {
				expect(urls.parse(url.parse('https://www.reddit.com/help/useragreement', true, true))).not.to.be.ok;
			});

			it('not from reddit.com/jobs', function() {
				expect(urls.parse(url.parse('https://www.reddit.com/jobs', true, true))).not.to.be.ok;
			});

			it('not from reddit.com/login', function() {
				expect(urls.parse(url.parse('https://www.reddit.com/login', true, true))).not.to.be.ok;
			});

			it('not from reddit.com/message', function() {
				expect(urls.parse(url.parse('https://www.reddit.com/message', true, true))).not.to.be.ok;
			});

			it('not from reddit.com/message/*', function() {
				expect(urls.parse(url.parse('https://www.reddit.com/message/unread/', true, true))).not.to.be.ok;
			});

			it('not from reddit.com/new', function() {
				expect(urls.parse(url.parse('https://www.reddit.com/new', true, true))).not.to.be.ok;
			});

			it('not from reddit.com/password', function() {
				expect(urls.parse(url.parse('https://www.reddit.com/password', true, true))).not.to.be.ok;
			});

			it('not from reddit.com/prefs', function() {
				expect(urls.parse(url.parse('https://www.reddit.com/prefs', true, true))).not.to.be.ok;
			});

			it('not from reddit.com/rising', function() {
				expect(urls.parse(url.parse('https://www.reddit.com/rising', true, true))).not.to.be.ok;
			});

			it('not from reddit.com/rules', function() {
				expect(urls.parse(url.parse('https://www.reddit.com/rules', true, true))).not.to.be.ok;
			});

			it('not from reddit.com/submit', function() {
				expect(urls.parse(url.parse('https://www.reddit.com/submit', true, true))).not.to.be.ok;
			});

			it('not from reddit.com/subreddits', function() {
				expect(urls.parse(url.parse('https://www.reddit.com/subreddits', true, true))).not.to.be.ok;
			});

			it('not from reddit.com/top', function() {
				expect(urls.parse(url.parse('https://www.reddit.com/top', true, true))).not.to.be.ok;
			});

			it('not from reddit.com/wiki', function() {
				expect(urls.parse(url.parse('https://www.reddit.com/wiki', true, true))).not.to.be.ok;
			});

			it('not from reddit.com/wiki/*', function() {
				expect(urls.parse(url.parse('https://www.reddit.com/wiki/reddiquette/', true, true))).not.to.be.ok;
			});
		});

		describe('into account', function() {
			it('from reddit.com/u/ACCOUNT_ID', function() {
				expect(urls.parse(url.parse('https://www.reddit.com/u/ACCOUNT_ID', true, true)))
					.to.eql({ api: 'reddit', type: 'account', id: 'ACCOUNT_ID' });
			});

			it('from reddit.com/u/ACCOUNT_ID/*', function() {
				expect(urls.parse(url.parse('https://www.reddit.com/u/ACCOUNT_ID/comments', true, true)))
					.to.eql({ api: 'reddit', type: 'account', id: 'ACCOUNT_ID' });
			});

			it('from reddit.com/user/ACCOUNT_ID', function() {
				expect(urls.parse(url.parse('https://www.reddit.com/user/ACCOUNT_ID', true, true)))
					.to.eql({ api: 'reddit', type: 'account', id: 'ACCOUNT_ID' });
			});

			it('from reddit.com/user/ACCOUNT_ID/*', function() {
				expect(urls.parse(url.parse('https://www.reddit.com/user/ACCOUNT_ID/comments', true, true)))
					.to.eql({ api: 'reddit', type: 'account', id: 'ACCOUNT_ID' });
			});
		});
	});

	describe('.represent', function() {
		it('should represent content', function() {
			var representations = urls.represent({ type: 'content', id: 'CONTENT_ID', subreddit: 'SUBREDDIT' });
			expect(representations).to.contain('https://www.reddit.com/r/SUBREDDIT/comments/CONTENT_ID');
			expect(representations).to.contain('https://redd.it/CONTENT_ID');
		});

		it('should represent content without subreddit', function() {
			var representations = urls.represent({ type: 'content', id: 'CONTENT_ID' });
			expect(representations).to.contain('https://www.reddit.com/comments/CONTENT_ID');
			expect(representations).to.contain('https://redd.it/CONTENT_ID');
		});

		it('should represent content with comment', function() {
			var representations = urls.represent({ type: 'content', id: 'CONTENT_ID', subreddit: 'SUBREDDIT' }, { id: 'COMMENT_ID' });
			expect(representations).to.contain('https://www.reddit.com/r/SUBREDDIT/comments/CONTENT_ID/comment/COMMENT_ID');
			expect(representations).to.contain('https://redd.it/CONTENT_ID');
		});

		it('should represent content without subreddit with comment', function() {
			var representations = urls.represent({ type: 'content', id: 'CONTENT_ID' }, { id: 'COMMENT_ID' });
			expect(representations).to.contain('https://www.reddit.com/comments/CONTENT_ID/comment/COMMENT_ID');
			expect(representations).to.contain('https://redd.it/CONTENT_ID');
		});

		it('should represent account', function() {
			var representations = urls.represent({ type: 'account', id: 'ACCOUNT_ID' });
			expect(representations).to.contain('https://www.reddit.com/user/ACCOUNT_ID');
		});
	});
});
