/* eslint-disable no-unused-expressions */
// TODO These mocha eslint-disables shouldn't be required
var chai      = require('chai');
var nock      = require('nock');
var sinon     = require('sinon');
var sinonChai = require('sinon-chai');
var expect    = chai.expect;
chai.use(sinonChai);

describe('imgur', function() {
	var imgur;

	/*
	before(function() {
		nock.recorder.rec();
	});
	*/

	beforeEach(function() {
		imgur = require('.')({ key: 'CLIENT_ID', mashape_key: 'MASHAPE_CLIENT_ID' });
	});

	afterEach(function() {
		nock.cleanAll();
	});

	describe('.content', function() {
		var gallery_endpoint;
		var default_image;
		var default_album;

		beforeEach(function() {
			gallery_endpoint = nock('https://imgur-apiv3.p.mashape.com/3')
				.get('/gallery/CONTENT_ID.json')
				.matchHeader('authorization', 'Client-ID CLIENT_ID')
				.matchHeader('x-mashape-key', 'MASHAPE_CLIENT_ID');

			default_image = { success: true, status:  200, data:    { id:          'CONTENT_ID', title:       'NAME', description: 'TEXT', datetime:    1432695552, type:        'image/jpeg', views:       1000, account_url: 'ACCOUNT_ID', score:       2000, is_album:    false } };

			default_album = { success: true, status:  200, data:    { id:          'CONTENT_ID', title:       'NAME', description: 'TEXT', datetime:    1432695552, cover:       'CONTENT_ID_1', views:       1000, account_url: 'ACCOUNT_ID', score:       2000, is_album:    true, images:      [{ id:          'CONTENT_ID_1', title:       'NAME 1', description: 'TEXT 1', datetime:    1432695552, type:        'image/jpeg', views:       1001 }, { id:          'CONTENT_ID_2', title:       'NAME 2', description: 'TEXT 2', datetime:    1432695552, type:        'image/gif', animated:    true, views:       1002, mp4:         'gif_2.mp4' }] } };
		});

		describe('as gallery', function() {
			it('should callback imgur gallery image', function(done) {
				gallery_endpoint.reply(200, default_image);

				imgur.content({ id: 'CONTENT_ID', as: 'gallery' }, function(err, content) {
					expect(err).not.to.exist;
					expect(content).to.eql({ api:     'imgur', type:    'content', id:      'CONTENT_ID', as:      'image', name:    'NAME', text:    'TEXT', date:    1432695552000, image:   { small:  'http://i.imgur.com/CONTENT_IDs.jpg', medium: 'http://i.imgur.com/CONTENT_IDm.jpg', large:  'http://i.imgur.com/CONTENT_IDl.jpg' }, stats:   { views: 1000, score: 2000 }, account: { api:  'imgur', type: 'account', id:   'ACCOUNT_ID' } });
					done();
				});
			});

			it('should callback imgur gallery album', function(done) {
				gallery_endpoint.reply(200, default_album);

				imgur.content({ id: 'CONTENT_ID', as: 'gallery' }, function(err, content) {
					expect(err).not.to.exist;
					expect(content).to.eql({ api:     'imgur', type:    'content', id:      'CONTENT_ID', as:      'album', name:    'NAME', text:    'TEXT', date:    1432695552000, image:   { small:  'http://i.imgur.com/CONTENT_ID_1s.jpg', medium: 'http://i.imgur.com/CONTENT_ID_1m.jpg', large:  'http://i.imgur.com/CONTENT_ID_1l.jpg' }, stats:   { views: 1000, score: 2000 }, account: { api:  'imgur', type: 'account', id:   'ACCOUNT_ID' }, content: [{ api:   'imgur', type:  'content', id:    'CONTENT_ID_1', as:    'image', name:  'NAME 1', text:  'TEXT 1', date:  1432695552000, image: { small:  'http://i.imgur.com/CONTENT_ID_1s.jpg', medium: 'http://i.imgur.com/CONTENT_ID_1m.jpg', large:  'http://i.imgur.com/CONTENT_ID_1l.jpg' }, stats: { views: 1001 } }, { api:   'imgur', type:  'content', id:    'CONTENT_ID_2', as:    'image', name:  'NAME 2', text:  'TEXT 2', date:  1432695552000, image: { small:  'http://i.imgur.com/CONTENT_ID_2s.jpg', medium: 'http://i.imgur.com/CONTENT_ID_2m.jpg', large:  'http://i.imgur.com/CONTENT_ID_2l.jpg' }, gif:   'gif_2.mp4', stats: { views: 1002 } }] });
					done();
				});
			});
		});

		describe('as image', function() {
			var image_endpoint;

			beforeEach(function() {
				image_endpoint = nock('https://imgur-apiv3.p.mashape.com/3')
					.get('/image/CONTENT_ID.json')
					.matchHeader('authorization', 'Client-ID CLIENT_ID')
					.matchHeader('x-mashape-key', 'MASHAPE_CLIENT_ID');
			});

			it('should callback imgur gallery image', function(done) {
				gallery_endpoint.reply(200, default_image);

				imgur.content({ id: 'CONTENT_ID', as: 'image' }, function(err, content) {
					expect(err).not.to.exist;
					expect(content).to.eql({ api:     'imgur', type:    'content', id:      'CONTENT_ID', as:      'image', name:    'NAME', text:    'TEXT', date:    1432695552000, image:   { small:  'http://i.imgur.com/CONTENT_IDs.jpg', medium: 'http://i.imgur.com/CONTENT_IDm.jpg', large:  'http://i.imgur.com/CONTENT_IDl.jpg' }, stats:   { views: 1000, score: 2000 }, account: { api:  'imgur', type: 'account', id:   'ACCOUNT_ID' } });
					done();
				});
			});

			it('should callback imgur image', function(done) {
				delete default_image.data.account_url;
				delete default_image.data.score;
				delete default_image.data.is_album;
				gallery_endpoint.reply(404, { success: false, status: 404 });
				image_endpoint.reply(200, default_image);

				imgur.content({ id: 'CONTENT_ID', as: 'image' }, function(err, content) {
					expect(err).not.to.exist;
					expect(content).to.eql({ api:         'imgur', type:        'content', id:          'CONTENT_ID', as:          'image', name:        'NAME', text:        'TEXT', date:        1432695552000, image:       { small:  'http://i.imgur.com/CONTENT_IDs.jpg', medium: 'http://i.imgur.com/CONTENT_IDm.jpg', large:  'http://i.imgur.com/CONTENT_IDl.jpg' }, stats:       { views: 1000 }, discussions: [{ api:           'imgur', type:          'discussion', id:            'CONTENT_ID', uncommentable: true }] });
					done();
				});
			});

			it('should callback with gif', function(done) {
				default_image.data.type = 'image/gif';
				default_image.data.animated = true;
				default_image.data.mp4 = 'gif.mp4';
				gallery_endpoint.reply(404, { success: false, status: 404 });
				image_endpoint.reply(200, default_image);

				imgur.content({ id: 'CONTENT_ID', as: 'image' }, function(err, content) {
					expect(err).not.to.exist;
					expect(content).to.have.property('gif', 'gif.mp4');
					done();
				});
			});

			it('should callback imgur gallery image without suffix', function(done) {
				nock('https://imgur-apiv3.p.mashape.com/3')
					.get('/gallery/CONTENT_IDh.json')
					.matchHeader('authorization', 'Client-ID CLIENT_ID')
					.matchHeader('x-mashape-key', 'MASHAPE_CLIENT_ID')
					.reply(404, { success: false, status: 404 });
				nock('https://imgur-apiv3.p.mashape.com/3')
					.get('/image/CONTENT_IDh.json')
					.matchHeader('authorization', 'Client-ID CLIENT_ID')
					.matchHeader('x-mashape-key', 'MASHAPE_CLIENT_ID')
					.reply(404, { success: false, status: 404 });
				gallery_endpoint.reply(200, default_image);

				imgur.content({ id: 'CONTENT_IDh', as: 'image' }, function(err, content) {
					expect(err).not.to.exist;
					expect(content).to.eql({ api:     'imgur', type:    'content', id:      'CONTENT_ID', as:      'image', name:    'NAME', text:    'TEXT', date:    1432695552000, image:   { small:  'http://i.imgur.com/CONTENT_IDs.jpg', medium: 'http://i.imgur.com/CONTENT_IDm.jpg', large:  'http://i.imgur.com/CONTENT_IDl.jpg' }, stats:   { views: 1000, score: 2000 }, account: { api:  'imgur', type: 'account', id:   'ACCOUNT_ID' } });
					done();
				});
			});

			it('should callback imgur image without suffix', function(done) {
				delete default_image.data.account_url;
				delete default_image.data.score;
				delete default_image.data.is_album;
				nock('https://imgur-apiv3.p.mashape.com/3')
					.get('/gallery/CONTENT_IDh.json')
					.matchHeader('authorization', 'Client-ID CLIENT_ID')
					.matchHeader('x-mashape-key', 'MASHAPE_CLIENT_ID')
					.reply(404, { success: false, status: 404 });
				nock('https://imgur-apiv3.p.mashape.com/3')
					.get('/image/CONTENT_IDh.json')
					.matchHeader('authorization', 'Client-ID CLIENT_ID')
					.matchHeader('x-mashape-key', 'MASHAPE_CLIENT_ID')
					.reply(404, { success: false, status: 404 });
				gallery_endpoint.reply(404, { success: false, status: 404 });
				image_endpoint.reply(200, default_image);

				imgur.content({ id: 'CONTENT_IDh', as: 'image' }, function(err, content) {
					expect(err).not.to.exist;
					expect(content).to.eql({ api:         'imgur', type:        'content', id:          'CONTENT_ID', as:          'image', name:        'NAME', text:        'TEXT', date:        1432695552000, image:       { small:  'http://i.imgur.com/CONTENT_IDs.jpg', medium: 'http://i.imgur.com/CONTENT_IDm.jpg', large:  'http://i.imgur.com/CONTENT_IDl.jpg' }, stats:       { views: 1000 }, discussions: [{ api:           'imgur', type:          'discussion', id:            'CONTENT_ID', uncommentable: true }] });
					done();
				});
			});

			describe('image endpoint', function() {
				beforeEach(function() {
					delete default_image.data.account_url;
					delete default_image.data.score;
					delete default_image.data.is_album;
					gallery_endpoint.reply(404, { success: false, status: 404 });
				});

				it('should try api.imgur on 503', function(done) {
					image_endpoint.reply(503, { success: false, status: 503 });
					nock('https://api.imgur.com/3')
						.get('/image/CONTENT_ID.json')
						.matchHeader('authorization', 'Client-ID CLIENT_ID')
						.reply(200, default_image);

					imgur.content({ id: 'CONTENT_ID', as: 'image' }, function(err, content, usage) {
						expect(err).not.to.exist;
						expect(content).to.exist;
						expect(usage).to.have.property('mashape-requests', 2);
						expect(usage).to.have.property('imgur-requests', 1);
						done();
					});
				});

				it('should 429 on 429', function(done) {
					image_endpoint.reply(429, { success: false, status: 429 });

					imgur.content({ id: 'CONTENT_ID', as: 'image' }, function(err) {
						expect(err).to.eql({ message: 'Imgur Image', status: 429 });
						done();
					});
				});

				it('should 500 on 4xx', function(done) {
					image_endpoint.reply(478, { success: false, status: 478 });

					imgur.content({ id: 'CONTENT_ID', as: 'image' }, function(err) {
						expect(err).to.eql({ message: 'Imgur Image', status: 500, original_status: 478 });
						done();
					});
				});

				it('should 502 on 5xx', function(done) {
					image_endpoint.reply(578, { success: false, status: 578 });

					imgur.content({ id: 'CONTENT_ID', as: 'image' }, function(err) {
						expect(err).to.eql({ message: 'Imgur Image', status: 502, original_status: 578 });
						done();
					});
				});
			});
		});

		describe('as album', function() {
			var album_endpoint;

			beforeEach(function() {
				album_endpoint = nock('https://imgur-apiv3.p.mashape.com/3')
					.get('/album/CONTENT_ID.json')
					.matchHeader('authorization', 'Client-ID CLIENT_ID')
					.matchHeader('x-mashape-key', 'MASHAPE_CLIENT_ID');
			});

			it('should callback imgur gallery album', function(done) {
				gallery_endpoint.reply(200, default_album);

				imgur.content({ id: 'CONTENT_ID', as: 'album' }, function(err, content) {
					expect(err).not.to.exist;
					expect(content).to.eql({ api:     'imgur', type:    'content', id:      'CONTENT_ID', as:      'album', name:    'NAME', text:    'TEXT', date:    1432695552000, image:   { small:  'http://i.imgur.com/CONTENT_ID_1s.jpg', medium: 'http://i.imgur.com/CONTENT_ID_1m.jpg', large:  'http://i.imgur.com/CONTENT_ID_1l.jpg' }, stats:   { views: 1000, score: 2000 }, account: { api:  'imgur', type: 'account', id:   'ACCOUNT_ID' }, content: [{ api:   'imgur', type:  'content', id:    'CONTENT_ID_1', as:    'image', name:  'NAME 1', text:  'TEXT 1', date:  1432695552000, image: { small:  'http://i.imgur.com/CONTENT_ID_1s.jpg', medium: 'http://i.imgur.com/CONTENT_ID_1m.jpg', large:  'http://i.imgur.com/CONTENT_ID_1l.jpg' }, stats: { views: 1001 } }, { api:   'imgur', type:  'content', id:    'CONTENT_ID_2', as:    'image', name:  'NAME 2', text:  'TEXT 2', date:  1432695552000, image: { small:  'http://i.imgur.com/CONTENT_ID_2s.jpg', medium: 'http://i.imgur.com/CONTENT_ID_2m.jpg', large:  'http://i.imgur.com/CONTENT_ID_2l.jpg' }, gif:   'gif_2.mp4', stats: { views: 1002 } }] });
					done();
				});
			});

			it('should callback imgur album', function(done) {
				delete default_album.data.score;
				delete default_album.data.is_album;
				gallery_endpoint.reply(404, { success: false, status: 404 });
				album_endpoint.reply(200, default_album);

				imgur.content({ id: 'CONTENT_ID', as: 'album' }, function(err, content) {
					expect(err).not.to.exist;
					expect(content).to.eql({ api:        'imgur', type:       'content', id:         'CONTENT_ID', as:         'album', name:       'NAME', text:       'TEXT', date:       1432695552000, image:      { small:  'http://i.imgur.com/CONTENT_ID_1s.jpg', medium: 'http://i.imgur.com/CONTENT_ID_1m.jpg', large:  'http://i.imgur.com/CONTENT_ID_1l.jpg' }, stats:      { views: 1000 }, account:    { api:  'imgur', type: 'account', id:   'ACCOUNT_ID' }, content:    [{ api:   'imgur', type:  'content', id:    'CONTENT_ID_1', as:    'image', name:  'NAME 1', text:  'TEXT 1', date:  1432695552000, image: { small:  'http://i.imgur.com/CONTENT_ID_1s.jpg', medium: 'http://i.imgur.com/CONTENT_ID_1m.jpg', large:  'http://i.imgur.com/CONTENT_ID_1l.jpg' }, stats: { views: 1001 } }, { api:   'imgur', type:  'content', id:    'CONTENT_ID_2', as:    'image', name:  'NAME 2', text:  'TEXT 2', date:  1432695552000, image: { small:  'http://i.imgur.com/CONTENT_ID_2s.jpg', medium: 'http://i.imgur.com/CONTENT_ID_2m.jpg', large:  'http://i.imgur.com/CONTENT_ID_2l.jpg' }, gif:   'gif_2.mp4', stats: { views: 1002 } }], discussions: [{ api:           'imgur', type:          'discussion', id:            'CONTENT_ID', uncommentable: true }] });
					done();
				});
			});

			describe('album endpoint', function() {
				beforeEach(function() {
					delete default_album.data.score;
					delete default_album.data.is_album;
					gallery_endpoint.reply(404, { success: false, status: 404 });
				});

				it('should try api.imgur on 503', function(done) {
					album_endpoint.reply(503, { success: false, status: 503 });
					nock('https://api.imgur.com/3')
						.get('/album/CONTENT_ID.json')
						.matchHeader('authorization', 'Client-ID CLIENT_ID')
						.reply(200, default_album);

					imgur.content({ id: 'CONTENT_ID', as: 'album' }, function(err, content, usage) {
						expect(err).not.to.exist;
						expect(content).to.exist;
						expect(usage).to.have.property('mashape-requests', 2);
						expect(usage).to.have.property('imgur-requests', 1);
						done();
					});
				});

				it('should 429 on 429', function(done) {
					album_endpoint.reply(429, { success: false, status: 429 });

					imgur.content({ id: 'CONTENT_ID', as: 'album' }, function(err) {
						expect(err).to.eql({ message: 'Imgur Album', status: 429 });
						done();
					});
				});

				it('should 500 on 4xx', function(done) {
					album_endpoint.reply(478, { success: false, status: 478 });

					imgur.content({ id: 'CONTENT_ID', as: 'album' }, function(err) {
						expect(err).to.eql({ message: 'Imgur Album', status: 500, original_status: 478 });
						done();
					});
				});

				it('should 502 on 5xx', function(done) {
					album_endpoint.reply(578, { success: false, status: 578 });

					imgur.content({ id: 'CONTENT_ID', as: 'album' }, function(err) {
						expect(err).to.eql({ message: 'Imgur Album', status: 502, original_status: 578 });
						done();
					});
				});
			});
		});

		it('should replace newlines in the text with linebreaks', function(done) {
			default_image.data.description = 'TE\nXT';
			gallery_endpoint.reply(200, default_image);

			imgur.content({ id: 'CONTENT_ID', as: 'gallery' }, function(err, content) {
				expect(err).not.to.be.ok;
				expect(content).to.have.property('text', 'TE<br>XT');
				done();
			});
		});

		describe('usage', function() {
			it('should report', function(done) {
				gallery_endpoint.reply(200, default_image);

				imgur.content({ id: 'CONTENT_ID', as: 'gallery' }, function(err, content, usage) {
					expect(usage).to.have.property('mashape-requests', 1);
					expect(usage).to.have.property('imgur-requests', 0);
					done();
				});
			});
		});

		describe('gallery endpoint', function() {
			it('should try api.imgur on 503', function(done) {
				gallery_endpoint.reply(503, { success: false, status: 503 });
				nock('https://api.imgur.com/3')
					.get('/gallery/CONTENT_ID.json')
					.matchHeader('authorization', 'Client-ID CLIENT_ID')
					.reply(200, default_image);

				imgur.content({ id: 'CONTENT_ID', as: 'gallery' }, function(err, content, usage) {
					expect(err).not.to.exist;
					expect(content).to.exist;
					expect(usage).to.have.property('mashape-requests', 1);
					expect(usage).to.have.property('imgur-requests', 1);
					done();
				});
			});

			it('should 429 on 429', function(done) {
				gallery_endpoint.reply(429, { success: false, status: 429 });

				imgur.content({ id: 'CONTENT_ID', as: 'gallery' }, function(err) {
					expect(err).to.eql({ message: 'Imgur Gallery', status: 429 });
					done();
				});
			});

			it('should 500 on 4xx', function(done) {
				gallery_endpoint.reply(478, { success: false, status: 478 });

				imgur.content({ id: 'CONTENT_ID', as: 'gallery' }, function(err) {
					expect(err).to.eql({ message: 'Imgur Gallery', status: 500, original_status: 478 });
					done();
				});
			});

			it('should 502 on 5xx', function(done) {
				gallery_endpoint.reply(578, { success: false, status: 578 });

				imgur.content({ id: 'CONTENT_ID', as: 'gallery' }, function(err) {
					expect(err).to.eql({ message: 'Imgur Gallery', status: 502, original_status: 578 });
					done();
				});
			});
		});
	});

	describe('.discussion', function() {
		var comments_endpoint;
		var default_comments;

		beforeEach(function() {
			comments_endpoint = nock('https://imgur-apiv3.p.mashape.com/3')
				.get('/gallery/CONTENT_ID/comments.json')
				.matchHeader('authorization', 'Client-ID CLIENT_ID')
				.matchHeader('x-mashape-key', 'MASHAPE_CLIENT_ID');

			default_comments = { success: true, status:  200, data:    [{ id:       'COMMENT_ID_1', comment:  'TEXT 1', author:   'ACCOUNT_ID_1', points:   1001, datetime: 1435165745 }, { id:       'COMMENT_ID_2', comment:  'TEXT 2', author:   'ACCOUNT_ID_2', points:   1002, datetime: 1435165745 }, { id:       'COMMENT_ID_3', comment:  'TEXT 3', author:   'ACCOUNT_ID_3', points:   1003, datetime: 1435165745 }] };
		});

		it('should callback imgur comments', function(done) {
			comments_endpoint.reply(200, default_comments);

			imgur.discussion({ id: 'CONTENT_ID' }, function(err, discussion) {
				expect(err).not.to.exist;
				expect(discussion).to.eql({ api:      'imgur', type:     'discussion', id:       'CONTENT_ID', comments: [{ api:     'imgur', type:    'comment', id:      'COMMENT_ID_1', text:    'TEXT 1', date:    1435165745000, stats:   { score: 1001 }, account: { api:  'imgur', type: 'account', id:   'ACCOUNT_ID_1' } }, { api:     'imgur', type:    'comment', id:      'COMMENT_ID_2', text:    'TEXT 2', date:    1435165745000, stats:   { score: 1002 }, account: { api:  'imgur', type: 'account', id:   'ACCOUNT_ID_2' } }, { api:     'imgur', type:    'comment', id:      'COMMENT_ID_3', text:    'TEXT 3', date:    1435165745000, stats:   { score: 1003 }, account: { api:  'imgur', type: 'account', id:   'ACCOUNT_ID_3' } }] });
				done();
			});
		});

		it('should callback with comment replies with at least half the score of next comment', function(done) {
			default_comments.data[0].children = [{ id:       'COMMENT_ID_1_1', comment:  'TEXT 1_1', author:   'ACCOUNT_ID_1_1', points:   501, datetime: 1435165745 }];
			default_comments.data[1].children = [{ id:       'COMMENT_ID_2_1', comment:  'TEXT 2_1', author:   'ACCOUNT_ID_2_1', points:   2, datetime: 1435165745 }];
			comments_endpoint.reply(200, default_comments);

			imgur.discussion({ id: 'CONTENT_ID' }, function(err, discussion) {
				expect(err).not.to.be.ok;
				expect(discussion).to.have.deep.property('comments[0].replies').that.eql([{ api:     'imgur', type:    'comment', id:      'COMMENT_ID_1_1', text:    'TEXT 1_1', date:    1435165745000, stats:   { score: 501 }, account: { api:  'imgur', type: 'account', id:   'ACCOUNT_ID_1_1' } }]);
				expect(discussion).not.to.have.deep.property('comments[1].replies');
				expect(discussion).not.to.have.deep.property('comments[2].replies');
				done();
			});
		});

		it('should replace newlines in the text with linebreaks', function(done) {
			default_comments.data[0].comment = 'TEXT\n1';
			default_comments.data[1].comment = 'TEXT\n2';
			default_comments.data[2].comment = 'TEXT\n3';
			comments_endpoint.reply(200, default_comments);

			imgur.discussion({ id: 'CONTENT_ID' }, function(err, discussion) {
				expect(err).not.to.be.ok;
				expect(discussion).to.have.deep.property('comments[0].text', 'TEXT<br>1');
				expect(discussion).to.have.deep.property('comments[1].text', 'TEXT<br>2');
				expect(discussion).to.have.deep.property('comments[2].text', 'TEXT<br>3');
				done();
			});
		});

		describe('usage', function() {
			it('should report', function(done) {
				comments_endpoint.reply(200, default_comments);

				imgur.discussion({ id: 'CONTENT_ID' }, function(err, discussion, usage) {
					expect(usage).to.have.property('mashape-requests', 1);
					expect(usage).to.have.property('imgur-requests', 0);
					done();
				});
			});
		});

		describe('comments endpoint', function() {
			it('should try api.imgur on 503', function(done) {
				comments_endpoint.reply(503, { success: false, status: 503 });
				nock('https://api.imgur.com/3')
					.get('/gallery/CONTENT_ID/comments.json')
					.matchHeader('authorization', 'Client-ID CLIENT_ID')
					.reply(200, default_comments);

				imgur.discussion({ id: 'CONTENT_ID' }, function(err, discussion, usage) {
					expect(err).not.to.exist;
					expect(discussion).to.exist;
					expect(usage).to.have.property('mashape-requests', 1);
					expect(usage).to.have.property('imgur-requests', 1);
					done();
				});
			});

			it('should 404 on 404', function(done) {
				comments_endpoint.reply(404, { success: false, status: 404 });

				imgur.discussion({ id: 'CONTENT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Imgur Gallery Comments', status: 404 });
					done();
				});
			});

			it('should 429 on 429', function(done) {
				comments_endpoint.reply(429, { success: false, status: 429 });

				imgur.discussion({ id: 'CONTENT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Imgur Gallery Comments', status: 429 });
					done();
				});
			});

			it('should 500 on 4xx', function(done) {
				comments_endpoint.reply(478, { success: false, status: 478 });

				imgur.discussion({ id: 'CONTENT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Imgur Gallery Comments', status: 500, original_status: 478 });
					done();
				});
			});

			it('should 502 on 5xx', function(done) {
				comments_endpoint.reply(578, { success: false, status: 578 });

				imgur.discussion({ id: 'CONTENT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Imgur Gallery Comments', status: 502, original_status: 578 });
					done();
				});
			});
		});
	});

	describe('.account', function() {
		var account_endpoint;
		var default_account;
		var sandbox;
		var urls;

		beforeEach(function() {
			account_endpoint = nock('https://imgur-apiv3.p.mashape.com/3')
				.get('/account/ACCOUNT_ID.json')
				.matchHeader('authorization', 'Client-ID CLIENT_ID')
				.matchHeader('x-mashape-key', 'MASHAPE_CLIENT_ID');

			sandbox = sinon.sandbox.create();
			urls = require('../urls');

			default_account = { success: true, status:  200, data:    { url:        'ACCOUNT_ID', bio:        'TEXT', reputation: 1000, created:    1347228597 } };
		});

		afterEach(function() {
			sandbox.restore();
		});

		it('should callback imgur user', function(done) {
			account_endpoint.reply(200, default_account);

			imgur.account({ id: 'ACCOUNT_ID' }, function(err, account) {
				expect(err).not.to.exist;
				expect(account).to.eql({ api:   'imgur', type:  'account', id:    'ACCOUNT_ID', text:  'TEXT', date:  1347228597000, stats: { score: 1000 } });
				done();
			});
		});

		it('should reference accounts in text', function(done) {
			default_account.data.bio = 'https://www.hovercards.com';
			account_endpoint.reply(200, default_account);

			sandbox.stub(urls, 'parse');
			urls.parse.withArgs('https://www.hovercards.com').returns({ api: 'someapi', type: 'account', id: 'ACCOUNT_ID_1' });

			imgur.account({ id: 'ACCOUNT_ID' }, function(err, account) {
				expect(err).not.to.be.ok;
				expect(account.accounts).to.contain({ api: 'someapi', type: 'account', id: 'ACCOUNT_ID_1' });
				done();
			});
		});

		it('should replace newlines in the text with linebreaks', function(done) {
			default_account.data.bio = 'TE\nXT';
			account_endpoint.reply(200, default_account);

			imgur.account({ id: 'ACCOUNT_ID' }, function(err, account) {
				expect(err).not.to.be.ok;
				expect(account).to.have.property('text', 'TE<br>XT');
				done();
			});
		});

		describe('usage', function() {
			it('should report', function(done) {
				account_endpoint.reply(200, default_account);

				imgur.account({ id: 'ACCOUNT_ID' }, function(err, account, usage) {
					expect(usage).to.have.property('mashape-requests', 1);
					expect(usage).to.have.property('imgur-requests', 0);
					done();
				});
			});
		});

		describe('account endpoint', function() {
			it('should try api.imgur on 503', function(done) {
				account_endpoint.reply(503, { success: false, status: 503 });
				nock('https://api.imgur.com/3')
					.get('/account/ACCOUNT_ID.json')
					.matchHeader('authorization', 'Client-ID CLIENT_ID')
					.reply(200, default_account);

				imgur.account({ id: 'ACCOUNT_ID' }, function(err, account, usage) {
					expect(err).not.to.exist;
					expect(account).to.exist;
					expect(usage).to.have.property('mashape-requests', 1);
					expect(usage).to.have.property('imgur-requests', 1);
					done();
				});
			});

			it('should 404 on 404', function(done) {
				account_endpoint.reply(404, { success: false, status: 404 });

				imgur.account({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Imgur Account', status: 404 });
					done();
				});
			});

			it('should 429 on 429', function(done) {
				account_endpoint.reply(429, { success: false, status: 429 });

				imgur.account({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Imgur Account', status: 429 });
					done();
				});
			});

			it('should 500 on 4xx', function(done) {
				account_endpoint.reply(478, { success: false, status: 478 });

				imgur.account({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Imgur Account', status: 500, original_status: 478 });
					done();
				});
			});

			it('should 502 on 5xx', function(done) {
				account_endpoint.reply(578, { success: false, status: 578 });

				imgur.account({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Imgur Account', status: 502, original_status: 578 });
					done();
				});
			});
		});
	});

	describe('.account_content', function() {
		var account_submissions_endpoint;
		var default_account_submissions;

		beforeEach(function() {
			account_submissions_endpoint = nock('https://imgur-apiv3.p.mashape.com/3')
				.get('/account/ACCOUNT_ID/submissions/0.json')
				.matchHeader('authorization', 'Client-ID CLIENT_ID')
				.matchHeader('x-mashape-key', 'MASHAPE_CLIENT_ID');

			default_account_submissions = { success: true, status:  200, data:    [{ id: 'CONTENT_ID_1', title: 'NAME 1', is_album: false }, { id: 'CONTENT_ID_2', title: 'NAME 2', is_album: false, type: 'image/gif', animated: true, mp4: 'gif.mp4' }, { id: 'CONTENT_ID_3', title: 'NAME 3', is_album: true, cover: 'CONTENT_ID_4' }] };
		});

		it('should callback imgur images and albums', function(done) {
			account_submissions_endpoint.reply(200, default_account_submissions);

			imgur.account_content({ id: 'ACCOUNT_ID' }, function(err, account_content) {
				expect(err).not.to.exist;
				expect(account_content).to.eql({ api:     'imgur', type:    'account_content', id:      'ACCOUNT_ID', content: [{ api:   'imgur', type:  'content', id:    'CONTENT_ID_1', as:    'image', name:  'NAME 1', image: { small:  'http://i.imgur.com/CONTENT_ID_1s.jpg', medium: 'http://i.imgur.com/CONTENT_ID_1m.jpg', large:  'http://i.imgur.com/CONTENT_ID_1l.jpg' } }, { api:   'imgur', type:  'content', id:    'CONTENT_ID_2', as:    'image', name:  'NAME 2', image: { small:  'http://i.imgur.com/CONTENT_ID_2s.jpg', medium: 'http://i.imgur.com/CONTENT_ID_2m.jpg', large:  'http://i.imgur.com/CONTENT_ID_2l.jpg' }, gif:   'gif.mp4' }, { api:   'imgur', type:  'content', id:    'CONTENT_ID_3', as:    'album', name:  'NAME 3', image: { small:  'http://i.imgur.com/CONTENT_ID_4s.jpg', medium: 'http://i.imgur.com/CONTENT_ID_4m.jpg', large:  'http://i.imgur.com/CONTENT_ID_4l.jpg' } }] });
				done();
			});
		});

		describe('usage', function() {
			it('should report', function(done) {
				account_submissions_endpoint.reply(200, default_account_submissions);

				imgur.account_content({ id: 'ACCOUNT_ID' }, function(err, account_content, usage) {
					expect(usage).to.have.property('mashape-requests', 1);
					expect(usage).to.have.property('imgur-requests', 0);
					done();
				});
			});
		});

		describe('account endpoint', function() {
			it('should try api.imgur on 503', function(done) {
				account_submissions_endpoint.reply(503, { success: false, status: 503 });
				nock('https://api.imgur.com/3')
					.get('/account/ACCOUNT_ID/submissions/0.json')
					.matchHeader('authorization', 'Client-ID CLIENT_ID')
					.reply(200, default_account_submissions);

				imgur.account_content({ id: 'ACCOUNT_ID' }, function(err, account_content, usage) {
					expect(err).not.to.exist;
					expect(account_content).to.exist;
					expect(usage).to.have.property('mashape-requests', 1);
					expect(usage).to.have.property('imgur-requests', 1);
					done();
				});
			});

			it('should 404 on 404', function(done) {
				account_submissions_endpoint.reply(404, { success: false, status: 404 });

				imgur.account_content({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Imgur Account Submissions', status: 404 });
					done();
				});
			});

			it('should 429 on 429', function(done) {
				account_submissions_endpoint.reply(429, { success: false, status: 429 });

				imgur.account_content({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Imgur Account Submissions', status: 429 });
					done();
				});
			});

			it('should 500 on 4xx', function(done) {
				account_submissions_endpoint.reply(478, { success: false, status: 478 });

				imgur.account_content({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Imgur Account Submissions', status: 500, original_status: 478 });
					done();
				});
			});

			it('should 502 on 5xx', function(done) {
				account_submissions_endpoint.reply(578, { success: false, status: 578 });

				imgur.account_content({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Imgur Account Submissions', status: 502, original_status: 578 });
					done();
				});
			});
		});
	});
});

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
					.to.eql({ api:  'imgur', type: 'content', id:   'CONTENT_ID', as:   'image' });
			});

			it('from imgur.com/CONTENT_ID', function() {
				expect(urls.parse(url.parse('https://imgur.com/CONTENT_ID', true, true)))
					.to.eql({ api:  'imgur', type: 'content', id:   'CONTENT_ID', as:   'image' });
			});

			it('from imgur.com/a/CONTENT_ID', function() {
				expect(urls.parse(url.parse('https://imgur.com/a/CONTENT_ID', true, true)))
					.to.eql({ api:  'imgur', type: 'content', id:   'CONTENT_ID', as:   'album' });
			});

			it('from imgur.com/a/CONTENT_ID/*', function() {
				expect(urls.parse(url.parse('https://imgur.com/a/CONTENT_ID/jibberish', true, true)))
					.to.eql({ api:  'imgur', type: 'content', id:   'CONTENT_ID', as:   'album' });
			});

			it('from imgur.com/gallery/CONTENT_ID', function() {
				expect(urls.parse(url.parse('https://imgur.com/gallery/CONTENT_ID', true, true)))
					.to.eql({ api:  'imgur', type: 'content', id:   'CONTENT_ID', as:   'gallery' });
			});

			it('from imgur.com/gallery/CONTENT_ID/new', function() {
				expect(urls.parse(url.parse('https://imgur.com/gallery/CONTENT_ID/new', true, true)))
					.to.eql({ api:  'imgur', type: 'content', id:   'CONTENT_ID', as:   'gallery' });
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
