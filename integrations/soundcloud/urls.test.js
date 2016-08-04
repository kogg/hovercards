/* eslint-disable no-unused-expressions */
var chai   = require('chai');
var expect = chai.expect;

describe('soundcloud urls', function() {
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
			it('from soundcloud.com/ACCOUNT_ID/CONTENT_ID', function() {
				expect(urls.parse(url.parse('https://www.soundcloud.com/ACCOUNT_ID/CONTENT_ID', true, true)))
					.to.eql({ api:     'soundcloud', type:    'content', id:      'CONTENT_ID', account: { api:  'soundcloud', type: 'account', id:   'ACCOUNT_ID' } });
			});

			it('from soundcloud.com/ACCOUNT_ID/CONTENT_ID/*', function() {
				expect(urls.parse(url.parse('https://www.soundcloud.com/ACCOUNT_ID/CONTENT_ID/likes', true, true)))
					.to.eql({ api:     'soundcloud', type:    'content', id:      'CONTENT_ID', account: { api:  'soundcloud', type: 'account', id:   'ACCOUNT_ID' } });
			});

			it('from soundcloud.com/ACCOUNT_ID/sets/CONTENT_ID', function() {
				expect(urls.parse(url.parse('https://www.soundcloud.com/ACCOUNT_ID/sets/CONTENT_ID', true, true)))
					.to.eql({ api:     'soundcloud', type:    'content', id:      'CONTENT_ID', as:      'playlist', account: { api:  'soundcloud', type: 'account', id:   'ACCOUNT_ID' } });
			});

			it('from soundcloud.com/ACCOUNT_ID/sets/CONTENT_ID/*', function() {
				expect(urls.parse(url.parse('https://www.soundcloud.com/ACCOUNT_ID/sets/CONTENT_ID/likes', true, true)))
					.to.eql({ api:     'soundcloud', type:    'content', id:      'CONTENT_ID', as:      'playlist', account: { api:  'soundcloud', type: 'account', id:   'ACCOUNT_ID' } });
			});
		});

		describe('into account', function() {
			it('from soundcloud.com/ACCOUNT_ID', function() {
				expect(urls.parse(url.parse('https://www.soundcloud.com/ACCOUNT_ID', true, true)))
					.to.eql({ api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' });
			});

			it('from soundcloud.com/ACCOUNT_ID/comments', function() {
				expect(urls.parse(url.parse('https://www.soundcloud.com/ACCOUNT_ID/comments', true, true)))
					.to.eql({ api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' });
			});

			it('from soundcloud.com/ACCOUNT_ID/groups', function() {
				expect(urls.parse(url.parse('https://www.soundcloud.com/ACCOUNT_ID/groups', true, true)))
					.to.eql({ api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' });
			});

			it('from soundcloud.com/ACCOUNT_ID/followers', function() {
				expect(urls.parse(url.parse('https://www.soundcloud.com/ACCOUNT_ID/followers', true, true)))
					.to.eql({ api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' });
			});

			it('from soundcloud.com/ACCOUNT_ID/following', function() {
				expect(urls.parse(url.parse('https://www.soundcloud.com/ACCOUNT_ID/following', true, true)))
					.to.eql({ api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' });
			});

			it('from soundcloud.com/ACCOUNT_ID/likes', function() {
				expect(urls.parse(url.parse('https://www.soundcloud.com/ACCOUNT_ID/likes', true, true)))
					.to.eql({ api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' });
			});

			it('from soundcloud.com/ACCOUNT_ID/sets', function() {
				expect(urls.parse(url.parse('https://www.soundcloud.com/ACCOUNT_ID/sets', true, true)))
					.to.eql({ api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' });
			});

			it('from soundcloud.com/ACCOUNT_ID/tracks', function() {
				expect(urls.parse(url.parse('https://www.soundcloud.com/ACCOUNT_ID/tracks', true, true)))
					.to.eql({ api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' });
			});

			it('not from soundcloud.com/explore', function() {
				expect(urls.parse(url.parse('https://www.soundcloud.com/explore', true, true))).not.to.be.ok;
			});

			it('not from soundcloud.com/groups', function() {
				expect(urls.parse(url.parse('https://www.soundcloud.com/groups', true, true))).not.to.be.ok;
			});

			it('not from soundcloud.com/jobs', function() {
				expect(urls.parse(url.parse('https://www.soundcloud.com/jobs', true, true))).not.to.be.ok;
			});

			it('not from soundcloud.com/messages', function() {
				expect(urls.parse(url.parse('https://www.soundcloud.com/messages', true, true))).not.to.be.ok;
			});

			it('not from soundcloud.com/mobile', function() {
				expect(urls.parse(url.parse('https://www.soundcloud.com/mobile', true, true))).not.to.be.ok;
			});

			it('not from soundcloud.com/notifications', function() {
				expect(urls.parse(url.parse('https://www.soundcloud.com/notifications', true, true))).not.to.be.ok;
			});

			it('not from soundcloud.com/pages', function() {
				expect(urls.parse(url.parse('https://www.soundcloud.com/pages', true, true))).not.to.be.ok;
			});

			it('not from soundcloud.com/people', function() {
				expect(urls.parse(url.parse('https://www.soundcloud.com/people', true, true))).not.to.be.ok;
			});

			it('not from soundcloud.com/pro', function() {
				expect(urls.parse(url.parse('https://www.soundcloud.com/pro', true, true))).not.to.be.ok;
			});

			it('not from soundcloud.com/settings', function() {
				expect(urls.parse(url.parse('https://www.soundcloud.com/settings', true, true))).not.to.be.ok;
			});

			it('not from soundcloud.com/stream', function() {
				expect(urls.parse(url.parse('https://www.soundcloud.com/stream', true, true))).not.to.be.ok;
			});

			it('not from soundcloud.com/tags', function() {
				expect(urls.parse(url.parse('https://www.soundcloud.com/tags', true, true))).not.to.be.ok;
			});

			it('not from soundcloud.com/terms-of-use', function() {
				expect(urls.parse(url.parse('https://www.soundcloud.com/terms-of-use', true, true))).not.to.be.ok;
			});

			it('not from soundcloud.com/upload', function() {
				expect(urls.parse(url.parse('https://www.soundcloud.com/upload', true, true))).not.to.be.ok;
			});

			it('not from soundcloud.com/upload-classic', function() {
				expect(urls.parse(url.parse('https://www.soundcloud.com/upload-classic', true, true))).not.to.be.ok;
			});

			it('not from soundcloud.com/you', function() {
				expect(urls.parse(url.parse('https://www.soundcloud.com/you', true, true))).not.to.be.ok;
			});
		});
	});

	describe('.represent', function() {
		it('should represent content with account', function() {
			var representations = urls.represent({ type: 'content', id: 'CONTENT_ID', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } });
			expect(representations).to.contain('https://soundcloud.com/ACCOUNT_ID/CONTENT_ID');
		});

		it('should represent content with account with comment', function() {
			var representations = urls.represent({ type: 'content', id: 'CONTENT_ID', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } }, { id: 'COMMENT_ID' });
			expect(representations).to.contain('https://soundcloud.com/ACCOUNT_ID/CONTENT_ID/comments/COMMENT_ID');
		});

		it('should represent content as playlist with account', function() {
			var representations = urls.represent({ type: 'content', id: 'CONTENT_ID', as: 'playlist', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } });
			expect(representations).to.contain('https://soundcloud.com/ACCOUNT_ID/sets/CONTENT_ID');
		});

		it('should represent account', function() {
			var representations = urls.represent({ type: 'account', id: 'ACCOUNT_ID' });
			expect(representations).to.contain('https://soundcloud.com/ACCOUNT_ID');
		});
	});
});
