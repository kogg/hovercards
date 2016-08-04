/* eslint-disable no-unused-expressions */
var chai   = require('chai');
var expect = chai.expect;

describe('imgur urls', function() {
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
			it('from i.imgur.com/CONTENT_ID.jpg', function() {
				expect(urls.parse(url.parse('https://i.imgur.com/CONTENT_ID.jpg', true, true)))
					.to.eql({ api: 'imgur', type: 'content', id: 'CONTENT_ID', as: 'image' });
			});

			it('from imgur.com/CONTENT_ID', function() {
				expect(urls.parse(url.parse('https://imgur.com/CONTENT_ID', true, true)))
					.to.eql({ api: 'imgur', type: 'content', id: 'CONTENT_ID', as: 'image' });
			});

			it('from imgur.com/a/CONTENT_ID', function() {
				expect(urls.parse(url.parse('https://imgur.com/a/CONTENT_ID', true, true)))
					.to.eql({ api: 'imgur', type: 'content', id: 'CONTENT_ID', as: 'album' });
			});

			it('from imgur.com/a/CONTENT_ID/*', function() {
				expect(urls.parse(url.parse('https://imgur.com/a/CONTENT_ID/jibberish', true, true)))
					.to.eql({ api: 'imgur', type: 'content', id: 'CONTENT_ID', as: 'album' });
			});

			it('from imgur.com/gallery/CONTENT_ID', function() {
				expect(urls.parse(url.parse('https://imgur.com/gallery/CONTENT_ID', true, true)))
					.to.eql({ api: 'imgur', type: 'content', id: 'CONTENT_ID', as: 'gallery' });
			});

			it('from imgur.com/gallery/CONTENT_ID/new', function() {
				expect(urls.parse(url.parse('https://imgur.com/gallery/CONTENT_ID/new', true, true)))
					.to.eql({ api: 'imgur', type: 'content', id: 'CONTENT_ID', as: 'gallery' });
			});
		});

		describe('into account', function() {
			it('from imgur.com/user/ACCOUNT_ID', function() {
				expect(urls.parse(url.parse('http://imgur.com/user/ACCOUNT_ID', true, true)))
					.to.eql({ api: 'imgur', type: 'account', id: 'ACCOUNT_ID' });
			});

			it('from imgur.com/user/ACCOUNT_ID/index/*', function() {
				expect(urls.parse(url.parse('http://imgur.com/user/ACCOUNT_ID/index/newest', true, true)))
					.to.eql({ api: 'imgur', type: 'account', id: 'ACCOUNT_ID' });
			});

			it('from imgur.com/user/ACCOUNT_ID/submitted', function() {
				expect(urls.parse(url.parse('http://imgur.com/user/ACCOUNT_ID/submitted', true, true)))
					.to.eql({ api: 'imgur', type: 'account', id: 'ACCOUNT_ID' });
			});

			it('from imgur.com/user/ACCOUNT_ID/submitted/*', function() {
				expect(urls.parse(url.parse('http://imgur.com/user/ACCOUNT_ID/submitted/newest', true, true)))
					.to.eql({ api: 'imgur', type: 'account', id: 'ACCOUNT_ID' });
			});

			it('from imgur.com/user/ACCOUNT_ID/favorites', function() {
				expect(urls.parse(url.parse('http://imgur.com/user/ACCOUNT_ID/favorites', true, true)))
					.to.eql({ api: 'imgur', type: 'account', id: 'ACCOUNT_ID' });
			});

			it('from imgur.com/user/ACCOUNT_ID/favorites/*', function() {
				expect(urls.parse(url.parse('http://imgur.com/user/ACCOUNT_ID/favorites/newest', true, true)))
					.to.eql({ api: 'imgur', type: 'account', id: 'ACCOUNT_ID' });
			});
		});
	});

	describe('.represent', function() {
		it('should represent content as gallery', function() {
			var representations = urls.represent({ type: 'content', id: 'CONTENT_ID', as: 'gallery' });

			expect(representations).to.have.property(0, 'https://imgur.com/gallery/CONTENT_ID');
		});

		it('should represent content as gallery with comment', function() {
			var representations = urls.represent({ type: 'content', id: 'CONTENT_ID', as: 'gallery' }, { id: 'COMMENT_ID' });

			expect(representations).to.have.property(0, 'https://imgur.com/gallery/CONTENT_ID/comment/COMMENT_ID');
			expect(representations).to.contain('https://imgur.com/gallery/CONTENT_ID');
		});

		it('should represent content as image', function() {
			var representations = urls.represent({ type: 'content', id: 'CONTENT_ID', as: 'image' });

			expect(representations).to.have.property(0, 'https://imgur.com/CONTENT_ID');
			expect(representations).to.contain('https://i.imgur.com/CONTENT_ID');
			expect(representations).to.contain('https://imgur.com/gallery/CONTENT_ID');
		});

		it('should represent content as image with comment', function() {
			var representations = urls.represent({ type: 'content', id: 'CONTENT_ID', as: 'image' }, { id: 'COMMENT_ID' });

			expect(representations).to.have.property(0, 'https://imgur.com/gallery/CONTENT_ID/comment/COMMENT_ID');
			expect(representations).to.contain('https://imgur.com/gallery/CONTENT_ID');
			expect(representations).to.contain('https://imgur.com/CONTENT_ID');
			expect(representations).to.contain('https://i.imgur.com/CONTENT_ID');
		});

		it('should represent content as album', function() {
			var representations = urls.represent({ type: 'content', id: 'CONTENT_ID', as: 'album' });

			expect(representations).to.have.property(0, 'https://imgur.com/a/CONTENT_ID');
			expect(representations).to.contain('https://imgur.com/gallery/CONTENT_ID');
		});

		it('should represent content as album with comment', function() {
			var representations = urls.represent({ type: 'content', id: 'CONTENT_ID', as: 'album' }, { id: 'COMMENT_ID' });

			expect(representations).to.have.property(0, 'https://imgur.com/gallery/CONTENT_ID/comment/COMMENT_ID');
			expect(representations).to.contain('https://imgur.com/gallery/CONTENT_ID');
			expect(representations).to.contain('https://imgur.com/a/CONTENT_ID');
		});

		it('should represent account', function() {
			var representations = urls.represent({ type: 'account', id: 'ACCOUNT_ID' });

			expect(representations).to.have.property(0, 'https://imgur.com/user/ACCOUNT_ID');
		});
	});
});
