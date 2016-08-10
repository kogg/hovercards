/* eslint-disable no-unused-expressions */
var chai      = require('chai');
var sinon     = require('sinon');
var sinonChai = require('sinon-chai');
var expect    = chai.expect;
chai.use(sinonChai);

describe('urls', function() {
	var sandbox;
	var urls;

	beforeEach(function() {
		sandbox = sinon.sandbox.create();
	});

	afterEach(function() {
		sandbox.restore();
	});

	describe('.parse', function() {
		it('should call the correct api\'s urls.parse', function() {
			var youtube_urls = require('../youtube/urls');
			sandbox.stub(youtube_urls, 'parse');
			urls = require('.');

			var url_string = 'https://www.youtube.com';
			urls.parse(url_string);
			expect(youtube_urls.parse).to.have.been.calledWith(require('url').parse(url_string, true, true));
		});

		it('should parse through l.facebook.com links', function() {
			urls = require('.');
			sandbox.spy(urls, 'parse');

			var url_string = 'https://l.facebook.com/l.php?u=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DB1rnO_l46zM&h=NAQFdrek9';
			urls.parse(url_string);
			expect(urls.parse).to.have.been.calledWith('https://www.youtube.com/watch?v=B1rnO_l46zM');
		});
	});

	describe('.print', function() {
		it('should call the correct api\'s urls.represent()[0]', function() {
			var youtube_urls = require('../youtube/urls');
			var identity = { api: 'youtube' };
			sandbox.stub(youtube_urls, 'represent');
			youtube_urls.represent.withArgs(identity).returns(['test', 'test2']);
			urls = require('.');

			expect(urls.print(identity)).to.equal('test');
		});
	});

	describe('.represent', function() {
		it('should call the correct api\'s urls.represent()', function() {
			var youtube_urls = require('../youtube/urls');
			var identity = { api: 'youtube' };
			sandbox.stub(youtube_urls, 'represent');
			youtube_urls.represent.withArgs(identity).returns(['test', 'test2']);
			urls = require('.');

			expect(urls.represent(identity)).to.eql(['test', 'test2']);
		});
	});
});
