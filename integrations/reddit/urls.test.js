/* eslint-disable no-unused-expressions */
var chai   = require('chai');
var expect = chai.expect;

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

			it('not from reddit.com/explore', function() {
				expect(urls.parse(url.parse('https://www.reddit.com/explore', true, true))).not.to.be.ok;
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

			it('not from reddit.com/promoted', function() {
				expect(urls.parse(url.parse('https://www.reddit.com/promoted', true, true))).not.to.be.ok;
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
