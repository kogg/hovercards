/* eslint-disable no-unused-expressions */
var chai   = require('chai');
var expect = chai.expect;

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
