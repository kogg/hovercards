/* eslint-disable no-unused-expressions */
var chai   = require('chai');
var expect = chai.expect;

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
