/* eslint-disable max-nested-callbacks */
var chai           = require('chai');
var chaiAsPromised = require('chai-as-promised');
var nock           = require('nock');
var sinon          = require('sinon');
var sinonChai      = require('sinon-chai');
var expect         = chai.expect;
chai.use(chaiAsPromised);
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

			default_image = {
				success: true,
				status:  200,
				data:    {
					id:          'CONTENT_ID',
					title:       'NAME',
					description: 'TEXT',
					datetime:    1432695552,
					type:        'image/jpeg',
					views:       1000,
					account_url: 'ACCOUNT_ID',
					score:       2000,
					is_album:    false
				}
			};

			default_album = {
				success: true,
				status:  200,
				data:    {
					id:          'CONTENT_ID',
					title:       'NAME',
					description: 'TEXT',
					datetime:    1432695552,
					cover:       'CONTENT_ID_1',
					views:       1000,
					account_url: 'ACCOUNT_ID',
					score:       2000,
					is_album:    true,
					images:      [
						{
							id:          'CONTENT_ID_1',
							title:       'NAME 1',
							description: 'TEXT 1',
							datetime:    1432695552,
							type:        'image/jpeg',
							views:       1001
						},
						{
							id:          'CONTENT_ID_2',
							title:       'NAME 2',
							description: 'TEXT 2',
							datetime:    1432695552,
							type:        'image/gif',
							animated:    true,
							views:       1002,
							mp4:         'gif_2.mp4'
						}
					]
				}
			};
		});

		describe('as gallery', function() {
			it('should callback imgur gallery image', function() {
				gallery_endpoint.reply(200, default_image);

				return expect(imgur.content({ id: 'CONTENT_ID', as: 'gallery' })).to.eventually.eql({
					api:   'imgur',
					type:  'content',
					id:    'CONTENT_ID',
					as:    'image',
					name:  'NAME',
					text:  'TEXT',
					date:  1432695552000,
					image: {
						small:  'http://i.imgur.com/CONTENT_IDs.jpg',
						medium: 'http://i.imgur.com/CONTENT_IDm.jpg',
						large:  'http://i.imgur.com/CONTENT_IDl.jpg'
					},
					stats: {
						views: 1000,
						score: 2000
					},
					account: {
						api:  'imgur',
						type: 'account',
						id:   'ACCOUNT_ID'
					}
				});
			});

			it('should callback imgur gallery album', function() {
				gallery_endpoint.reply(200, default_album);

				return expect(imgur.content({ id: 'CONTENT_ID', as: 'gallery' })).to.eventually.eql({
					api:   'imgur',
					type:  'content',
					id:    'CONTENT_ID',
					as:    'album',
					name:  'NAME',
					text:  'TEXT',
					date:  1432695552000,
					image: {
						small:  'http://i.imgur.com/CONTENT_ID_1s.jpg',
						medium: 'http://i.imgur.com/CONTENT_ID_1m.jpg',
						large:  'http://i.imgur.com/CONTENT_ID_1l.jpg'
					},
					stats: {
						views: 1000,
						score: 2000
					},
					account: {
						api:  'imgur',
						type: 'account',
						id:   'ACCOUNT_ID'
					},
					content: [
						{
							api:   'imgur',
							type:  'content',
							id:    'CONTENT_ID_1',
							as:    'image',
							name:  'NAME 1',
							text:  'TEXT 1',
							date:  1432695552000,
							image: {
								small:  'http://i.imgur.com/CONTENT_ID_1s.jpg',
								medium: 'http://i.imgur.com/CONTENT_ID_1m.jpg',
								large:  'http://i.imgur.com/CONTENT_ID_1l.jpg'
							},
							stats: { views: 1001 }
						},
						{
							api:   'imgur',
							type:  'content',
							id:    'CONTENT_ID_2',
							as:    'image',
							name:  'NAME 2',
							text:  'TEXT 2',
							date:  1432695552000,
							image: {
								small:  'http://i.imgur.com/CONTENT_ID_2s.jpg',
								medium: 'http://i.imgur.com/CONTENT_ID_2m.jpg',
								large:  'http://i.imgur.com/CONTENT_ID_2l.jpg'
							},
							gif:   'gif_2.mp4',
							stats: { views: 1002 }
						}
					]
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

			it('should callback imgur gallery image', function() {
				gallery_endpoint.reply(200, default_image);

				return expect(imgur.content({ id: 'CONTENT_ID', as: 'image' })).to.eventually.eql({
					api:   'imgur',
					type:  'content',
					id:    'CONTENT_ID',
					as:    'image',
					name:  'NAME',
					text:  'TEXT',
					date:  1432695552000,
					image: {
						small:  'http://i.imgur.com/CONTENT_IDs.jpg',
						medium: 'http://i.imgur.com/CONTENT_IDm.jpg',
						large:  'http://i.imgur.com/CONTENT_IDl.jpg'
					},
					stats: {
						views: 1000,
						score: 2000
					},
					account: {
						api:  'imgur',
						type: 'account',
						id:   'ACCOUNT_ID'
					}
				});
			});

			it('should callback imgur image', function() {
				delete default_image.data.account_url;
				delete default_image.data.score;
				delete default_image.data.is_album;
				gallery_endpoint.reply(404, { success: false, status: 404 });
				image_endpoint.reply(200, default_image);

				return expect(imgur.content({ id: 'CONTENT_ID', as: 'image' })).to.eventually.eql({
					api:   'imgur',
					type:  'content',
					id:    'CONTENT_ID',
					as:    'image',
					name:  'NAME',
					text:  'TEXT',
					date:  1432695552000,
					image: {
						small:  'http://i.imgur.com/CONTENT_IDs.jpg',
						medium: 'http://i.imgur.com/CONTENT_IDm.jpg',
						large:  'http://i.imgur.com/CONTENT_IDl.jpg'
					},
					stats: {
						views: 1000
					},
					discussions: [
						{
							api:           'imgur',
							type:          'discussion',
							id:            'CONTENT_ID',
							uncommentable: true
						}
					]
				});
			});

			it('should callback with gif', function() {
				default_image.data.type = 'image/gif';
				default_image.data.animated = true;
				default_image.data.mp4 = 'gif.mp4';
				gallery_endpoint.reply(404, { success: false, status: 404 });
				image_endpoint.reply(200, default_image);

				return expect(imgur.content({ id: 'CONTENT_ID', as: 'image' })).to.eventually.have.property('gif', 'gif.mp4');
			});

			it('should callback imgur gallery image without suffix', function() {
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

				return expect(imgur.content({ id: 'CONTENT_IDh', as: 'image' })).to.eventually.eql({ api: 'imgur', type: 'content', id: 'CONTENT_ID', as: 'image', name: 'NAME', text: 'TEXT', date: 1432695552000, image: { small: 'http://i.imgur.com/CONTENT_IDs.jpg', medium: 'http://i.imgur.com/CONTENT_IDm.jpg', large: 'http://i.imgur.com/CONTENT_IDl.jpg' }, stats: { views: 1000, score: 2000 }, account: { api: 'imgur', type: 'account', id: 'ACCOUNT_ID' } });
			});

			it('should callback imgur image without suffix', function() {
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

				return expect(imgur.content({ id: 'CONTENT_IDh', as: 'image' })).to.eventually.eql({ api: 'imgur', type: 'content', id: 'CONTENT_ID', as: 'image', name: 'NAME', text: 'TEXT', date: 1432695552000, image: { small: 'http://i.imgur.com/CONTENT_IDs.jpg', medium: 'http://i.imgur.com/CONTENT_IDm.jpg', large: 'http://i.imgur.com/CONTENT_IDl.jpg' }, stats: { views: 1000 }, discussions: [{ api: 'imgur', type: 'discussion', id: 'CONTENT_ID', uncommentable: true }] });
			});

			describe('image endpoint', function() {
				beforeEach(function() {
					delete default_image.data.account_url;
					delete default_image.data.score;
					delete default_image.data.is_album;
					gallery_endpoint.reply(404, { success: false, status: 404 });
				});

				it('should try api.imgur on 503', function() {
					image_endpoint.reply(503, { success: false, status: 503 });
					nock('https://api.imgur.com/3')
						.get('/image/CONTENT_ID.json')
						.matchHeader('authorization', 'Client-ID CLIENT_ID')
						.reply(200, default_image);

					return expect(imgur.content({ id: 'CONTENT_ID', as: 'image' })).to.eventually.be.ok;
				});

				it('should 429 on 429', function() {
					image_endpoint.reply(429, { success: false, status: 429 });

					return expect(imgur.content({ id: 'CONTENT_ID', as: 'image' })).to.be.rejected.and.to.eventually.have.property('code', 429);
				});

				it('should 500 on 4xx', function() {
					image_endpoint.reply(478, { success: false, status: 478 });

					var promise = imgur.content({ id: 'CONTENT_ID', as: 'image' });

					return Promise.all([
						expect(promise).to.be.rejected.and.to.eventually.have.property('code', 500),
						expect(promise).to.be.rejected.and.to.eventually.have.property('original_code', 478)
					]);
				});

				it('should 502 on 5xx', function() {
					image_endpoint.reply(578, { success: false, status: 578 });

					var promise = imgur.content({ id: 'CONTENT_ID', as: 'image' });

					return Promise.all([
						expect(promise).to.be.rejected.and.to.eventually.have.property('code', 502),
						expect(promise).to.be.rejected.and.to.eventually.have.property('original_code', 578)
					]);
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

			it('should callback imgur gallery album', function() {
				gallery_endpoint.reply(200, default_album);

				return expect(imgur.content({ id: 'CONTENT_ID', as: 'album' })).to.eventually.eql({ api: 'imgur', type: 'content', id: 'CONTENT_ID', as: 'album', name: 'NAME', text: 'TEXT', date: 1432695552000, image: { small: 'http://i.imgur.com/CONTENT_ID_1s.jpg', medium: 'http://i.imgur.com/CONTENT_ID_1m.jpg', large: 'http://i.imgur.com/CONTENT_ID_1l.jpg' }, stats: { views: 1000, score: 2000 }, account: { api: 'imgur', type: 'account', id: 'ACCOUNT_ID' }, content: [{ api: 'imgur', type: 'content', id: 'CONTENT_ID_1', as: 'image', name: 'NAME 1', text: 'TEXT 1', date: 1432695552000, image: { small: 'http://i.imgur.com/CONTENT_ID_1s.jpg', medium: 'http://i.imgur.com/CONTENT_ID_1m.jpg', large: 'http://i.imgur.com/CONTENT_ID_1l.jpg' }, stats: { views: 1001 } }, { api: 'imgur', type: 'content', id: 'CONTENT_ID_2', as: 'image', name: 'NAME 2', text: 'TEXT 2', date: 1432695552000, image: { small: 'http://i.imgur.com/CONTENT_ID_2s.jpg', medium: 'http://i.imgur.com/CONTENT_ID_2m.jpg', large: 'http://i.imgur.com/CONTENT_ID_2l.jpg' }, gif: 'gif_2.mp4', stats: { views: 1002 } }] });
			});

			it('should callback imgur album', function() {
				delete default_album.data.score;
				delete default_album.data.is_album;
				gallery_endpoint.reply(404, { success: false, status: 404 });
				album_endpoint.reply(200, default_album);

				return expect(imgur.content({ id: 'CONTENT_ID', as: 'album' })).to.eventually.eql({ api: 'imgur', type: 'content', id: 'CONTENT_ID', as: 'album', name: 'NAME', text: 'TEXT', date: 1432695552000, image: { small: 'http://i.imgur.com/CONTENT_ID_1s.jpg', medium: 'http://i.imgur.com/CONTENT_ID_1m.jpg', large: 'http://i.imgur.com/CONTENT_ID_1l.jpg' }, stats: { views: 1000 }, account: { api: 'imgur', type: 'account', id: 'ACCOUNT_ID' }, content: [{ api: 'imgur', type: 'content', id: 'CONTENT_ID_1', as: 'image', name: 'NAME 1', text: 'TEXT 1', date: 1432695552000, image: { small: 'http://i.imgur.com/CONTENT_ID_1s.jpg', medium: 'http://i.imgur.com/CONTENT_ID_1m.jpg', large: 'http://i.imgur.com/CONTENT_ID_1l.jpg' }, stats: { views: 1001 } }, { api: 'imgur', type: 'content', id: 'CONTENT_ID_2', as: 'image', name: 'NAME 2', text: 'TEXT 2', date: 1432695552000, image: { small: 'http://i.imgur.com/CONTENT_ID_2s.jpg', medium: 'http://i.imgur.com/CONTENT_ID_2m.jpg', large: 'http://i.imgur.com/CONTENT_ID_2l.jpg' }, gif: 'gif_2.mp4', stats: { views: 1002 } }], discussions: [{ api: 'imgur', type: 'discussion', id: 'CONTENT_ID', uncommentable: true }] });
			});

			describe('album endpoint', function() {
				beforeEach(function() {
					delete default_album.data.score;
					delete default_album.data.is_album;
					gallery_endpoint.reply(404, { success: false, status: 404 });
				});

				it('should try api.imgur on 503', function() {
					album_endpoint.reply(503, { success: false, status: 503 });
					nock('https://api.imgur.com/3')
						.get('/album/CONTENT_ID.json')
						.matchHeader('authorization', 'Client-ID CLIENT_ID')
						.reply(200, default_album);

					return expect(imgur.content({ id: 'CONTENT_ID', as: 'album' })).to.eventually.be.ok;
				});

				it('should 429 on 429', function() {
					album_endpoint.reply(429, { success: false, status: 429 });

					return expect(imgur.content({ id: 'CONTENT_ID', as: 'album' })).to.be.rejected.and.to.eventually.have.property('code', 429);
				});

				it('should 500 on 4xx', function() {
					album_endpoint.reply(478, { success: false, status: 478 });

					var promise = imgur.content({ id: 'CONTENT_ID', as: 'album' });

					return Promise.all([
						expect(promise).to.be.rejected.and.to.eventually.have.property('code', 500),
						expect(promise).to.be.rejected.and.to.eventually.have.property('original_code', 478)
					]);
				});

				it('should 502 on 5xx', function() {
					album_endpoint.reply(578, { success: false, status: 578 });

					var promise = imgur.content({ id: 'CONTENT_ID', as: 'album' });

					return Promise.all([
						expect(promise).to.be.rejected.and.to.eventually.have.property('code', 502),
						expect(promise).to.be.rejected.and.to.eventually.have.property('original_code', 578)
					]);
				});
			});
		});

		it('should replace newlines in the text with linebreaks', function() {
			default_image.data.description = 'TE\nXT';
			gallery_endpoint.reply(200, default_image);

			return expect(imgur.content({ id: 'CONTENT_ID', as: 'gallery' })).to.eventually.have.property('text', 'TE<br>XT');
		});

		describe('gallery endpoint', function() {
			it('should try api.imgur on 503', function() {
				gallery_endpoint.reply(503, { success: false, status: 503 });
				nock('https://api.imgur.com/3')
					.get('/gallery/CONTENT_ID.json')
					.matchHeader('authorization', 'Client-ID CLIENT_ID')
					.reply(200, default_image);

				return expect(imgur.content({ id: 'CONTENT_ID', as: 'gallery' })).to.eventually.be.ok;
			});

			it('should 429 on 429', function() {
				gallery_endpoint.reply(429, { success: false, status: 429 });

				return expect(imgur.content({ id: 'CONTENT_ID', as: 'gallery' })).to.be.rejected.and.to.eventually.have.property('code', 429);
			});

			it('should 500 on 4xx', function() {
				gallery_endpoint.reply(478, { success: false, status: 478 });

				var promise = imgur.content({ id: 'CONTENT_ID', as: 'gallery' });

				return Promise.all([
					expect(promise).to.be.rejected.and.to.eventually.have.property('code', 500),
					expect(promise).to.be.rejected.and.to.eventually.have.property('original_code', 478)
				]);
			});

			it('should 502 on 5xx', function() {
				gallery_endpoint.reply(578, { success: false, status: 578 });

				var promise = imgur.content({ id: 'CONTENT_ID', as: 'gallery' });

				return Promise.all([
					expect(promise).to.be.rejected.and.to.eventually.have.property('code', 502),
					expect(promise).to.be.rejected.and.to.eventually.have.property('original_code', 578)
				]);
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

			default_comments = { success: true, status: 200, data: [{ id: 'COMMENT_ID_1', comment: 'TEXT 1', author: 'ACCOUNT_ID_1', points: 1001, datetime: 1435165745 }, { id: 'COMMENT_ID_2', comment: 'TEXT 2', author: 'ACCOUNT_ID_2', points: 1002, datetime: 1435165745 }, { id: 'COMMENT_ID_3', comment: 'TEXT 3', author: 'ACCOUNT_ID_3', points: 1003, datetime: 1435165745 }] };
		});

		it('should callback imgur comments', function() {
			comments_endpoint.reply(200, default_comments);

			return expect(imgur.discussion({ id: 'CONTENT_ID' })).to.eventually.eql({ api: 'imgur', type: 'discussion', id: 'CONTENT_ID', comments: [{ api: 'imgur', type: 'comment', id: 'COMMENT_ID_1', text: 'TEXT 1', date: 1435165745000, stats: { score: 1001 }, account: { api: 'imgur', type: 'account', id: 'ACCOUNT_ID_1' } }, { api: 'imgur', type: 'comment', id: 'COMMENT_ID_2', text: 'TEXT 2', date: 1435165745000, stats: { score: 1002 }, account: { api: 'imgur', type: 'account', id: 'ACCOUNT_ID_2' } }, { api: 'imgur', type: 'comment', id: 'COMMENT_ID_3', text: 'TEXT 3', date: 1435165745000, stats: { score: 1003 }, account: { api: 'imgur', type: 'account', id: 'ACCOUNT_ID_3' } }] });
		});

		it('should callback with comment replies with at least half the score of next comment', function() {
			default_comments.data[0].children = [{ id: 'COMMENT_ID_1_1', comment: 'TEXT 1_1', author: 'ACCOUNT_ID_1_1', points: 501, datetime: 1435165745 }];
			default_comments.data[1].children = [{ id: 'COMMENT_ID_2_1', comment: 'TEXT 2_1', author: 'ACCOUNT_ID_2_1', points: 2, datetime: 1435165745 }];
			comments_endpoint.reply(200, default_comments);

			var promise = imgur.discussion({ id: 'CONTENT_ID' });

			return Promise.all([
				expect(promise).to.eventually.have.deep.property('comments[0].replies').that.eql([{ api: 'imgur', type: 'comment', id: 'COMMENT_ID_1_1', text: 'TEXT 1_1', date: 1435165745000, stats: { score: 501 }, account: { api: 'imgur', type: 'account', id: 'ACCOUNT_ID_1_1' } }]),
				expect(promise).to.eventually.not.have.deep.property('comments[1].replies'),
				expect(promise).to.eventually.not.have.deep.property('comments[2].replies')
			]);
		});

		it('should replace newlines in the text with linebreaks', function() {
			default_comments.data[0].comment = 'TEXT\n1';
			default_comments.data[1].comment = 'TEXT\n2';
			default_comments.data[2].comment = 'TEXT\n3';
			comments_endpoint.reply(200, default_comments);

			var promise = imgur.discussion({ id: 'CONTENT_ID' });

			return Promise.all([
				expect(promise).to.eventually.have.deep.property('comments[0].text', 'TEXT<br>1'),
				expect(promise).to.eventually.have.deep.property('comments[1].text', 'TEXT<br>2'),
				expect(promise).to.eventually.have.deep.property('comments[2].text', 'TEXT<br>3')
			]);
		});

		describe('comments endpoint', function() {
			it('should try api.imgur on 503', function() {
				comments_endpoint.reply(503, { success: false, status: 503 });
				nock('https://api.imgur.com/3')
					.get('/gallery/CONTENT_ID/comments.json')
					.matchHeader('authorization', 'Client-ID CLIENT_ID')
					.reply(200, default_comments);

				return expect(imgur.discussion({ id: 'CONTENT_ID' })).to.eventually.be.ok;
			});

			it('should 404 on 404', function() {
				comments_endpoint.reply(404, { success: false, status: 404 });

				return expect(imgur.discussion({ id: 'CONTENT_ID' })).to.be.rejected.and.to.eventually.have.property('code', 404);
			});

			it('should 429 on 429', function() {
				comments_endpoint.reply(429, { success: false, status: 429 });

				return expect(imgur.discussion({ id: 'CONTENT_ID' })).to.be.rejected.and.to.eventually.have.property('code', 429);
			});

			it('should 500 on 4xx', function() {
				comments_endpoint.reply(478, { success: false, status: 478 });

				var promise = imgur.discussion({ id: 'CONTENT_ID' });

				return Promise.all([
					expect(promise).to.be.rejected.and.to.eventually.have.property('code', 500),
					expect(promise).to.be.rejected.and.to.eventually.have.property('original_code', 478)
				]);
			});

			it('should 502 on 5xx', function() {
				comments_endpoint.reply(578, { success: false, status: 578 });

				var promise = imgur.discussion({ id: 'CONTENT_ID' });

				return Promise.all([
					expect(promise).to.be.rejected.and.to.eventually.have.property('code', 502),
					expect(promise).to.be.rejected.and.to.eventually.have.property('original_code', 578)
				]);
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

			default_account = { success: true, status: 200, data: { url: 'ACCOUNT_ID', bio: 'TEXT', reputation: 1000, created: 1347228597 } };
		});

		afterEach(function() {
			sandbox.restore();
		});

		it('should callback imgur user', function() {
			account_endpoint.reply(200, default_account);

			return expect(imgur.account({ id: 'ACCOUNT_ID' })).to.eventually.eql({ api: 'imgur', type: 'account', id: 'ACCOUNT_ID', text: 'TEXT', date: 1347228597000, stats: { score: 1000 } });
		});

		it('should reference accounts in text', function() {
			default_account.data.bio = 'https://www.hovercards.com';
			account_endpoint.reply(200, default_account);

			sandbox.stub(urls, 'parse');
			urls.parse.withArgs('https://www.hovercards.com').returns({ api: 'someapi', type: 'account', id: 'ACCOUNT_ID_1' });

			return expect(imgur.account({ id: 'ACCOUNT_ID' })).to.eventually.have.property('accounts')
				.that.contains({ api: 'someapi', type: 'account', id: 'ACCOUNT_ID_1' });
		});

		it('should replace newlines in the text with linebreaks', function() {
			default_account.data.bio = 'TE\nXT';
			account_endpoint.reply(200, default_account);

			return expect(imgur.account({ id: 'ACCOUNT_ID' })).to.eventually.have.property('text', 'TE<br>XT');
		});

		describe('account endpoint', function() {
			it('should try api.imgur on 503', function() {
				account_endpoint.reply(503, { success: false, status: 503 });
				nock('https://api.imgur.com/3')
					.get('/account/ACCOUNT_ID.json')
					.matchHeader('authorization', 'Client-ID CLIENT_ID')
					.reply(200, default_account);

				return expect(imgur.account({ id: 'ACCOUNT_ID' })).to.eventually.be.ok;
			});

			it('should 404 on 404', function() {
				account_endpoint.reply(404, { success: false, status: 404 });

				return expect(imgur.account({ id: 'ACCOUNT_ID' })).to.be.rejected.and.to.eventually.have.property('code', 404);
			});

			it('should 429 on 429', function() {
				account_endpoint.reply(429, { success: false, status: 429 });

				return expect(imgur.account({ id: 'ACCOUNT_ID' })).to.be.rejected.and.to.eventually.have.property('code', 429);
			});

			it('should 500 on 4xx', function() {
				account_endpoint.reply(478, { success: false, status: 478 });

				var promise = imgur.account({ id: 'ACCOUNT_ID' });

				return Promise.all([
					expect(promise).to.be.rejected.and.to.eventually.have.property('code', 500),
					expect(promise).to.be.rejected.and.to.eventually.have.property('original_code', 478)
				]);
			});

			it('should 502 on 5xx', function() {
				account_endpoint.reply(578, { success: false, status: 578 });

				var promise = imgur.account({ id: 'ACCOUNT_ID' });

				return Promise.all([
					expect(promise).to.be.rejected.and.to.eventually.have.property('code', 502),
					expect(promise).to.be.rejected.and.to.eventually.have.property('original_code', 578)
				]);
			});
		});
	});
});
