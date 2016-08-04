/* eslint-disable max-nested-callbacks */
var chai           = require('chai');
var chaiAsPromised = require('chai-as-promised');
var nock           = require('nock');
var sinon          = require('sinon');
var sinonChai      = require('sinon-chai');
var expect         = chai.expect;
chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('soundcloud', function() {
	var resolve_endpoint;
	var sandbox;
	var soundcloud;
	// var urls;

	/*
	before(function() {
		nock.recorder.rec();
	});
	*/

	before(function() {
		global.fetch = require('node-fetch');
	});

	after(function() {
		delete global.fetch;
	});

	beforeEach(function() {
		sandbox = sinon.sandbox.create();
		soundcloud = require('.')({ key: 'SOUNDCLOUD_CLIENT_ID' });
		// urls = require('../urls');

		resolve_endpoint = nock('https://api.soundcloud.com')
			.get('/resolve')
			.query({ client_id: 'SOUNDCLOUD_CLIENT_ID' });
	});

	afterEach(function() {
		nock.cleanAll();
		sandbox.restore();
	});

	describe('.content', function() {
		var tracks_endpoint;
		var default_track;

		// This is out here so we can use it for the usage/endpoint tests
		beforeEach(function() {
			tracks_endpoint = nock('https://api.soundcloud.com')
				.get('/tracks/SOUNDCLOUD_TRACK_ID')
				.query({ client_id: 'SOUNDCLOUD_CLIENT_ID' });

			default_track = {
				id:          'SOUNDCLOUD_TRACK_ID',
				kind:        'track',
				created_at:  '2015/06/29 15:48:11 +0000',
				commentable: true,
				permalink:   'CONTENT_ID',
				description: 'TEXT',
				title:       'NAME',
				artwork_url: 'image-large.jpg',
				user:        {
					permalink:  'ACCOUNT_ID',
					username:   'ACCOUNT NAME',
					avatar_url: 'account-image-large.jpg'
				},
				playback_count:    1002,
				favoritings_count: 1001,
				comment_count:     1003
			};
		});

		describe('for a track', function() {
			beforeEach(function() {
				resolve_endpoint
					.query({ url: 'https://soundcloud.com/ACCOUNT_ID/CONTENT_ID' })
					.reply(302, null, { location: 'https://api.soundcloud.com/tracks/SOUNDCLOUD_TRACK_ID?client_id=SOUNDCLOUD_CLIENT_ID' });
			});

			it('should callback a soundcloud track', function() {
				tracks_endpoint.reply(200, default_track);

				return expect(soundcloud.content({ id: 'CONTENT_ID', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } })).to.eventually.eql({
					api:   'soundcloud',
					type:  'content',
					id:    'CONTENT_ID',
					name:  'NAME',
					text:  'TEXT',
					date:  1435592891000,
					image: {
						small:  'image-large.jpg',
						medium: 'image-t300x300.jpg',
						large:  'image-t500x500.jpg'
					},
					stats: {
						likes:    1001,
						views:    1002,
						comments: 1003
					},
					account: {
						api:   'soundcloud',
						type:  'account',
						id:    'ACCOUNT_ID',
						name:  'ACCOUNT NAME',
						image: {
							small:  'account-image-large.jpg',
							medium: 'account-image-t300x300.jpg',
							large:  'account-image-t500x500.jpg'
						}
					}
				});
			});

			it('should callback with empty discussion when uncommentable', function() {
				default_track.commentable = false;
				tracks_endpoint.reply(200, default_track);

				return expect(soundcloud.content({ id: 'CONTENT_ID', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } }))
					.to.eventually.have.property('discussions').that.eql([{ api: 'soundcloud', type: 'discussion', id: 'CONTENT_ID', uncommentable: true }]);
			});

			it('should replace newlines with linebreaks in the text', function() {
				default_track.description = 'TE\nXT';
				tracks_endpoint.reply(200, default_track);

				return expect(soundcloud.content({ id: 'CONTENT_ID', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } }))
					.to.eventually.have.property('text', 'TE<br>XT');
			});

			it('should replace hashtags with links in the text', function() {
				default_track.description = '#thing #thing2';
				tracks_endpoint.reply(200, default_track);

				return expect(soundcloud.content({ id: 'CONTENT_ID', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } }))
					.to.eventually.have.property('text', '<a href="https://soundcloud.com/tags/thing" target="_blank" rel="noopener noreferrer">#thing</a> <a href="https://soundcloud.com/tags/thing2" target="_blank" rel="noopener noreferrer">#thing2</a>');
			});

			it('should replace accounts with links in the text', function() {
				default_track.description = '@ACCOUNT_ID_1 @ACCOUNT_ID_2';
				tracks_endpoint.reply(200, default_track);

				return expect(soundcloud.content({ id: 'CONTENT_ID', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } }))
					.to.eventually.have.property('text', '<a href="https://soundcloud.com/ACCOUNT_ID_1" target="_blank" rel="noopener noreferrer">@ACCOUNT_ID_1</a> <a href="https://soundcloud.com/ACCOUNT_ID_2" target="_blank" rel="noopener noreferrer">@ACCOUNT_ID_2</a>');
			});

			it('should remove the default image for account', function() {
				default_track.user.avatar_url = 'http://a1.sndcdn.com/images/default_avatar_large.png?142a848';
				tracks_endpoint.reply(200, default_track);

				return expect(soundcloud.content({ id: 'CONTENT_ID', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } }))
					.to.eventually.not.have.deep.property('account.image');
			});

			describe('tracks endpoint', function() {
				it('should 403 on 401', function() {
					tracks_endpoint.reply(401, '');

					return expect(soundcloud.content({ id: 'CONTENT_ID', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } }))
						.to.be.rejected.and.to.eventually.have.property('status', 403);
				});

				it('should 403 on 403', function() {
					tracks_endpoint.reply(403, '');

					return expect(soundcloud.content({ id: 'CONTENT_ID', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } }))
						.to.be.rejected.and.to.eventually.have.property('status', 403);
				});

				it('should 404 on 404', function() {
					tracks_endpoint.reply(404, '');

					return expect(soundcloud.content({ id: 'CONTENT_ID', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } }))
						.to.be.rejected.and.to.eventually.have.property('status', 404);
				});

				it('should 429 on 429', function() {
					tracks_endpoint.reply(429, '');

					return expect(soundcloud.content({ id: 'CONTENT_ID', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } }))
						.to.be.rejected.and.to.eventually.have.property('status', 429);
				});

				it('should 500 on 4xx', function() {
					tracks_endpoint.reply(478, '');

					var promise = soundcloud.content({ id: 'CONTENT_ID', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } });

					return Promise.all([
						expect(promise).to.be.rejected.and.to.eventually.have.property('status', 500),
						expect(promise).to.be.rejected.and.to.eventually.have.property('original_status', 478)
					]);
				});

				it('should 502 on 5xx', function() {
					tracks_endpoint.reply(578, '');

					var promise = soundcloud.content({ id: 'CONTENT_ID', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } });

					return Promise.all([
						expect(promise).to.be.rejected.and.to.eventually.have.property('status', 502),
						expect(promise).to.be.rejected.and.to.eventually.have.property('original_status', 578)
					]);
				});
			});
		});

		describe('for a playlist', function() {
			var playlists_endpoint;
			var default_playlist;

			beforeEach(function() {
				resolve_endpoint
					.query({ url: 'https://soundcloud.com/ACCOUNT_ID/sets/CONTENT_ID' })
					.reply(302, null, { location: 'https://api.soundcloud.com/playlists/SOUNDCLOUD_PLAYLIST_ID?client_id=SOUNDCLOUD_CLIENT_ID' });
				playlists_endpoint = nock('https://api.soundcloud.com')
					.get('/playlists/SOUNDCLOUD_PLAYLIST_ID')
					.query({ client_id: 'SOUNDCLOUD_CLIENT_ID' });

				default_playlist = {
					kind:        'playlist',
					created_at:  '2015/06/29 15:48:11 +0000',
					permalink:   'CONTENT_ID',
					description: 'TEXT',
					title:       'NAME',
					track_count: 1001,
					artwork_url: 'image-large.jpg',
					user:        {
						permalink:  'ACCOUNT_ID',
						username:   'ACCOUNT NAME',
						avatar_url: 'account-image-large.jpg'
					}
				};
			});

			it('should callback a soundcloud playlist', function() {
				playlists_endpoint.reply(200, default_playlist);

				return expect(soundcloud.content({ id: 'CONTENT_ID', as: 'playlist', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } })).to.eventually.eql({
					api:   'soundcloud',
					type:  'content',
					id:    'CONTENT_ID',
					as:    'playlist',
					name:  'NAME',
					text:  'TEXT',
					date:  1435592891000,
					image: {
						small:  'image-large.jpg',
						medium: 'image-t300x300.jpg',
						large:  'image-t500x500.jpg'
					},
					stats: {
						content: 1001
					},
					account: {
						api:   'soundcloud',
						type:  'account',
						id:    'ACCOUNT_ID',
						name:  'ACCOUNT NAME',
						image: {
							small:  'account-image-large.jpg',
							medium: 'account-image-t300x300.jpg',
							large:  'account-image-t500x500.jpg'
						}
					},
					discussions: [
						{
							api:           'soundcloud',
							type:          'discussion',
							id:            'CONTENT_ID',
							uncommentable: true
						}
					]
				});
			});

			it('should replace newlines with linebreaks in the text', function() {
				default_playlist.description = 'TE\nXT';
				playlists_endpoint.reply(200, default_playlist);

				return expect(soundcloud.content({ id: 'CONTENT_ID', as: 'playlist', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } }))
					.to.eventually.have.property('text', 'TE<br>XT');
			});

			it('should replace hashtags with links in the text', function() {
				default_playlist.description = '#thing #thing2';
				playlists_endpoint.reply(200, default_playlist);

				return expect(soundcloud.content({ id: 'CONTENT_ID', as: 'playlist', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } }))
					.to.eventually.have.property('text', '<a href="https://soundcloud.com/tags/thing" target="_blank" rel="noopener noreferrer">#thing</a> <a href="https://soundcloud.com/tags/thing2" target="_blank" rel="noopener noreferrer">#thing2</a>');
			});

			it('should replace accounts with links in the text', function() {
				default_playlist.description = '@ACCOUNT_ID_1 @ACCOUNT_ID_2';
				playlists_endpoint.reply(200, default_playlist);

				return expect(soundcloud.content({ id: 'CONTENT_ID', as: 'playlist', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } }))
					.to.eventually.have.property('text', '<a href="https://soundcloud.com/ACCOUNT_ID_1" target="_blank" rel="noopener noreferrer">@ACCOUNT_ID_1</a> <a href="https://soundcloud.com/ACCOUNT_ID_2" target="_blank" rel="noopener noreferrer">@ACCOUNT_ID_2</a>');
			});

			it('should remove the default image for account', function() {
				default_playlist.user.avatar_url = 'http://a1.sndcdn.com/images/default_avatar_large.png?142a848';
				playlists_endpoint.reply(200, default_playlist);

				return expect(soundcloud.content({ id: 'CONTENT_ID', as: 'playlist', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } }))
					.to.eventually.not.have.deep.property('account.image');
			});

			describe('playlists endpoint', function() {
				it('should 403 on 401', function() {
					playlists_endpoint.reply(401, '');

					return expect(soundcloud.content({ id: 'CONTENT_ID', as: 'playlist', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } }))
						.to.be.rejected.and.to.eventually.have.property('status', 403);
				});

				it('should 403 on 403', function() {
					playlists_endpoint.reply(403, '');

					return expect(soundcloud.content({ id: 'CONTENT_ID', as: 'playlist', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } }))
						.to.be.rejected.and.to.eventually.have.property('status', 403);
				});

				it('should 404 on 404', function() {
					playlists_endpoint.reply(404, '');

					return expect(soundcloud.content({ id: 'CONTENT_ID', as: 'playlist', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } }))
						.to.be.rejected.and.to.eventually.have.property('status', 404);
				});

				it('should 429 on 429', function() {
					playlists_endpoint.reply(429, '');

					return expect(soundcloud.content({ id: 'CONTENT_ID', as: 'playlist', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } }))
						.to.be.rejected.and.to.eventually.have.property('status', 429);
				});

				it('should 500 on 4xx', function() {
					playlists_endpoint.reply(478, '');

					var promise = soundcloud.content({ id: 'CONTENT_ID', as: 'playlist', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } });

					return Promise.all([
						expect(promise).to.be.rejected.and.to.eventually.have.property('status', 500),
						expect(promise).to.be.rejected.and.to.eventually.have.property('original_status', 478)
					]);
				});

				it('should 502 on 5xx', function() {
					playlists_endpoint.reply(578, '');

					var promise = soundcloud.content({ id: 'CONTENT_ID', as: 'playlist', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } });

					return Promise.all([
						expect(promise).to.be.rejected.and.to.eventually.have.property('status', 502),
						expect(promise).to.be.rejected.and.to.eventually.have.property('original_status', 578)
					]);
				});
			});
		});

		describe('resolve endpoint', function() {
			beforeEach(function() {
				resolve_endpoint = resolve_endpoint.query({ url: 'https://soundcloud.com/ACCOUNT_ID/CONTENT_ID' });
				tracks_endpoint.reply(200, default_track);
			});

			it('should 403 on 401', function() {
				resolve_endpoint.reply(401, '');

				return expect(soundcloud.content({ id: 'CONTENT_ID', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } }))
					.to.be.rejected.and.to.eventually.have.property('status', 403);
			});

			it('should 403 on 403', function() {
				resolve_endpoint.reply(403, '');

				return expect(soundcloud.content({ id: 'CONTENT_ID', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } }))
					.to.be.rejected.and.to.eventually.have.property('status', 403);
			});

			it('should 404 on 404', function() {
				resolve_endpoint.reply(404, '');

				return expect(soundcloud.content({ id: 'CONTENT_ID', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } }))
					.to.be.rejected.and.to.eventually.have.property('status', 404);
			});

			it('should 429 on 429', function() {
				resolve_endpoint.reply(429, '');

				return expect(soundcloud.content({ id: 'CONTENT_ID', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } }))
					.to.be.rejected.and.to.eventually.have.property('status', 429);
			});

			it('should 500 on 4xx', function() {
				resolve_endpoint.reply(478, '');

				var promise = soundcloud.content({ id: 'CONTENT_ID', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } });

				return Promise.all([
					expect(promise).to.be.rejected.and.to.eventually.have.property('status', 500),
					expect(promise).to.be.rejected.and.to.eventually.have.property('original_status', 478)
				]);
			});

			it('should 502 on 5xx', function() {
				resolve_endpoint.reply(578, '');

				var promise = soundcloud.content({ id: 'CONTENT_ID', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } });

				return Promise.all([
					expect(promise).to.be.rejected.and.to.eventually.have.property('status', 502),
					expect(promise).to.be.rejected.and.to.eventually.have.property('original_status', 578)
				]);
			});
		});
	});

	describe('.discussion', function() {
		var tracks_endpoint;
		var tracks_comments_endpoint;
		var default_track;
		var default_tracks_comments;

		beforeEach(function() {
			resolve_endpoint = resolve_endpoint.query({ url: 'https://soundcloud.com/ACCOUNT_ID/CONTENT_ID' });
			tracks_endpoint = nock('https://api.soundcloud.com')
				.get('/tracks/SOUNDCLOUD_TRACK_ID')
				.query({ client_id: 'SOUNDCLOUD_CLIENT_ID' });
			tracks_comments_endpoint = nock('https://api.soundcloud.com')
				.get('/tracks/SOUNDCLOUD_TRACK_ID/comments')
				.query({ client_id: 'SOUNDCLOUD_CLIENT_ID' });

			default_track = {
				id:          'SOUNDCLOUD_TRACK_ID',
				kind:        'track',
				created_at:  '2015/06/29 15:48:11 +0000',
				commentable: true,
				permalink:   'CONTENT_ID',
				description: 'TEXT',
				title:       'NAME',
				artwork_url: 'image-large.jpg',
				user:        {
					permalink:  'ACCOUNT_ID',
					username:   'ACCOUNT NAME',
					avatar_url: 'account-image-large.jpg'
				},
				playback_count:    1002,
				favoritings_count: 1001,
				comment_count:     1003
			};
			default_tracks_comments = [
				{
					id:         'SOUNDCLOUD_COMMENT_ID_1',
					created_at: '2015/04/28 03:37:27 +0000',
					timestamp:  1000,
					body:       'TEXT 1',
					user:       {
						permalink:  'ACCOUNT_ID_1',
						username:   'NAME 1',
						avatar_url: 'image-1-large.jpg'
					}
				},
				{
					id:         'SOUNDCLOUD_COMMENT_ID_2',
					created_at: '2015/04/27 03:37:27 +0000',
					timestamp:  2000,
					body:       'TEXT 2',
					user:       {
						permalink:  'ACCOUNT_ID_2',
						username:   'NAME 2',
						avatar_url: 'image-2-large.jpg'
					}
				}
			];
		});

		it('should callback soundcloud comments', function() {
			resolve_endpoint.reply(302, null, { location: 'https://api.soundcloud.com/tracks/SOUNDCLOUD_TRACK_ID?client_id=SOUNDCLOUD_CLIENT_ID' });
			tracks_endpoint.reply(200, default_track);
			tracks_comments_endpoint.reply(200, default_tracks_comments);

			return expect(soundcloud.discussion({ id: 'CONTENT_ID', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } })).to.eventually.eql({ api: 'soundcloud', type: 'discussion', id: 'CONTENT_ID', comments: [{ api: 'soundcloud', type: 'comment', id: 'SOUNDCLOUD_COMMENT_ID_1', text: 'TEXT 1', date: 1430192247000, time_offset: 1000, account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID_1', name: 'NAME 1', image: { small: 'image-1-large.jpg', medium: 'image-1-t300x300.jpg', large: 'image-1-t500x500.jpg' } } }, { api: 'soundcloud', type: 'comment', id: 'SOUNDCLOUD_COMMENT_ID_2', text: 'TEXT 2', date: 1430105847000, time_offset: 2000, account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID_2', name: 'NAME 2', image: { small: 'image-2-large.jpg', medium: 'image-2-t300x300.jpg', large: 'image-2-t500x500.jpg' } } }] });
		});

		it('should replace newlines with linebreaks in the text', function() {
			default_tracks_comments[0].body = 'TEXT\n1';
			default_tracks_comments[1].body = 'TEXT\n2';
			resolve_endpoint.reply(302, null, { location: 'https://api.soundcloud.com/tracks/SOUNDCLOUD_TRACK_ID?client_id=SOUNDCLOUD_CLIENT_ID' });
			tracks_endpoint.reply(200, default_track);
			tracks_comments_endpoint.reply(200, default_tracks_comments);

			var promise = soundcloud.discussion({ id: 'CONTENT_ID', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } });

			return Promise.all([
				expect(promise).to.eventually.have.deep.property('comments[0].text', 'TEXT<br>1'),
				expect(promise).to.eventually.have.deep.property('comments[1].text', 'TEXT<br>2')
			]);
		});

		it('should replace hashtags with links in the text', function() {
			default_tracks_comments[0].body = '#thing';
			default_tracks_comments[1].body = '#thing2';
			resolve_endpoint.reply(302, null, { location: 'https://api.soundcloud.com/tracks/SOUNDCLOUD_TRACK_ID?client_id=SOUNDCLOUD_CLIENT_ID' });
			tracks_endpoint.reply(200, default_track);
			tracks_comments_endpoint.reply(200, default_tracks_comments);

			var promise = soundcloud.discussion({ id: 'CONTENT_ID', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } });

			return Promise.all([
				expect(promise).to.eventually.have.deep.property('comments[0].text', '<a href="https://soundcloud.com/tags/thing" target="_blank" rel="noopener noreferrer">#thing</a>'),
				expect(promise).to.eventually.have.deep.property('comments[1].text', '<a href="https://soundcloud.com/tags/thing2" target="_blank" rel="noopener noreferrer">#thing2</a>')
			]);
		});

		it('should replace accounts with links in the text', function() {
			default_tracks_comments[0].body = '@ACCOUNT_ID_1';
			default_tracks_comments[1].body = '@ACCOUNT_ID_2';
			resolve_endpoint.reply(302, null, { location: 'https://api.soundcloud.com/tracks/SOUNDCLOUD_TRACK_ID?client_id=SOUNDCLOUD_CLIENT_ID' });
			tracks_endpoint.reply(200, default_track);
			tracks_comments_endpoint.reply(200, default_tracks_comments);

			var promise = soundcloud.discussion({ id: 'CONTENT_ID', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } });

			return Promise.all([
				expect(promise).to.eventually.have.deep.property('comments[0].text', '<a href="https://soundcloud.com/ACCOUNT_ID_1" target="_blank" rel="noopener noreferrer">@ACCOUNT_ID_1</a>'),
				expect(promise).to.eventually.have.deep.property('comments[1].text', '<a href="https://soundcloud.com/ACCOUNT_ID_2" target="_blank" rel="noopener noreferrer">@ACCOUNT_ID_2</a>')
			]);
		});

		it('should remove the default image for accounts', function() {
			default_tracks_comments[0].user.avatar_url = 'http://a1.sndcdn.com/images/default_avatar_large.png?142a848';
			default_tracks_comments[1].user.avatar_url = 'http://a1.sndcdn.com/images/default_avatar_large.png?142a848';
			resolve_endpoint.reply(302, null, { location: 'https://api.soundcloud.com/tracks/SOUNDCLOUD_TRACK_ID?client_id=SOUNDCLOUD_CLIENT_ID' });
			tracks_endpoint.reply(200, default_track);
			tracks_comments_endpoint.reply(200, default_tracks_comments);

			var promise = soundcloud.discussion({ id: 'CONTENT_ID', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } });

			return Promise.all([
				expect(promise).to.eventually.not.have.deep.property('comments[0].user.image'),
				expect(promise).to.eventually.not.have.deep.property('comments[1].user.image')
			]);
		});

		describe('resolve endpoint', function() {
			beforeEach(function() {
				tracks_endpoint.reply(200, default_track);
				tracks_comments_endpoint.reply(200, default_tracks_comments);
			});

			it('should 403 on 401', function() {
				resolve_endpoint.reply(401, '');

				return expect(soundcloud.discussion({ id: 'CONTENT_ID', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } }))
					.to.be.rejected.and.to.eventually.have.property('status', 403);
			});

			it('should 403 on 403', function() {
				resolve_endpoint.reply(403, '');

				return expect(soundcloud.discussion({ id: 'CONTENT_ID', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } }))
					.to.be.rejected.and.to.eventually.have.property('status', 403);
			});

			it('should 404 on 404', function() {
				resolve_endpoint.reply(404, '');

				return expect(soundcloud.discussion({ id: 'CONTENT_ID', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } }))
					.to.be.rejected.and.to.eventually.have.property('status', 404);
			});

			it('should 429 on 429', function() {
				resolve_endpoint.reply(429, '');

				return expect(soundcloud.discussion({ id: 'CONTENT_ID', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } }))
					.to.be.rejected.and.to.eventually.have.property('status', 429);
			});

			it('should 500 on 4xx', function() {
				resolve_endpoint.reply(478, '');

				var promise = soundcloud.discussion({ id: 'CONTENT_ID', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } });

				return Promise.all([
					expect(promise).to.be.rejected.and.to.eventually.have.property('status', 500),
					expect(promise).to.be.rejected.and.to.eventually.have.property('original_status', 478)
				]);
			});

			it('should 502 on 5xx', function() {
				resolve_endpoint.reply(578, '');

				var promise = soundcloud.discussion({ id: 'CONTENT_ID', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } });

				return Promise.all([
					expect(promise).to.be.rejected.and.to.eventually.have.property('status', 502),
					expect(promise).to.be.rejected.and.to.eventually.have.property('original_status', 578)
				]);
			});
		});

		describe('tracks comments endpoint', function() {
			beforeEach(function() {
				resolve_endpoint.reply(302, null, { location: 'https://api.soundcloud.com/tracks/SOUNDCLOUD_TRACK_ID?client_id=SOUNDCLOUD_CLIENT_ID' });
				tracks_endpoint.reply(200, default_track);
			});

			it('should 403 on 401', function() {
				tracks_comments_endpoint.reply(401, '');

				return expect(soundcloud.discussion({ id: 'CONTENT_ID', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } }))
					.to.be.rejected.and.to.eventually.have.property('status', 403);
			});

			it('should 403 on 403', function() {
				tracks_comments_endpoint.reply(403, '');

				return expect(soundcloud.discussion({ id: 'CONTENT_ID', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } }))
					.to.be.rejected.and.to.eventually.have.property('status', 403);
			});

			it('should 404 on 404', function() {
				tracks_comments_endpoint.reply(404, '');

				return expect(soundcloud.discussion({ id: 'CONTENT_ID', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } }))
					.to.be.rejected.and.to.eventually.have.property('status', 404);
			});

			it('should 429 on 429', function() {
				tracks_comments_endpoint.reply(429, '');

				return expect(soundcloud.discussion({ id: 'CONTENT_ID', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } }))
					.to.be.rejected.and.to.eventually.have.property('status', 429);
			});

			it('should 500 on 4xx', function() {
				tracks_comments_endpoint.reply(478, '');

				var promise = soundcloud.discussion({ id: 'CONTENT_ID', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } });

				return Promise.all([
					expect(promise).to.be.rejected.and.to.eventually.have.property('status', 500),
					expect(promise).to.be.rejected.and.to.eventually.have.property('original_status', 478)
				]);
			});

			it('should 502 on 5xx', function() {
				tracks_comments_endpoint.reply(578, '');

				var promise = soundcloud.discussion({ id: 'CONTENT_ID', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } });

				return Promise.all([
					expect(promise).to.be.rejected.and.to.eventually.have.property('status', 502),
					expect(promise).to.be.rejected.and.to.eventually.have.property('original_status', 578)
				]);
			});
		});
	});

	/*
	describe('.account', function() {
		var users_endpoint;
		var web_profiles_endpoint;
		var default_user;
		var default_web_profiles;

		beforeEach(function() {
			resolve_endpoint = resolve_endpoint.query({ url: 'https://soundcloud.com/ACCOUNT_ID' });
			users_endpoint = nock('https://api.soundcloud.com')
				.get('/users/SOUNDCLOUD_USER_ID')
				.query({ client_id: 'SOUNDCLOUD_CLIENT_ID' });
			web_profiles_endpoint = nock('https://api.soundcloud.com')
				.get('/users/SOUNDCLOUD_USER_ID/web-profiles')
				.query({ client_id: 'SOUNDCLOUD_CLIENT_ID' });

			sandbox.stub(urls, 'parse');

			default_user = { id:               'SOUNDCLOUD_USER_ID', permalink:        'ACCOUNT_ID', username:         'NAME', avatar_url:       'image-large.jpg', description:      'TEXT', track_count:      1000, followers_count:  2000, followings_count: 3000 };
			default_web_profiles = [];
		});

		it('should callback soundcloud user', function() {
			resolve_endpoint.reply(302, null, { location: 'https://api.soundcloud.com/users/SOUNDCLOUD_USER_ID?client_id=SOUNDCLOUD_CLIENT_ID' });
			users_endpoint.reply(200, default_user);
			web_profiles_endpoint.reply(200, default_web_profiles);

			soundcloud.account({ id: 'ACCOUNT_ID' }, function(err, account) {
				expect(err).not.to.be.ok;
				expect(account).to.eql({ api:   'soundcloud', type:  'account', id:    'ACCOUNT_ID', name:  'NAME', text:  'TEXT', image: { small:  'image-large.jpg', medium: 'image-t300x300.jpg', large:  'image-t500x500.jpg' }, stats: { content:   1000, followers: 2000, following: 3000 } });
				done();
			});
		});

		it('should reference accounts in text', function() {
			default_user.description = 'https://www.hovercards.com @ACCOUNT_ID_2';
			resolve_endpoint.reply(302, null, { location: 'https://api.soundcloud.com/users/SOUNDCLOUD_USER_ID?client_id=SOUNDCLOUD_CLIENT_ID' });
			users_endpoint.reply(200, default_user);
			web_profiles_endpoint.reply(200, default_web_profiles);

			urls.parse.withArgs('https://www.hovercards.com').returns({ api: 'someapi', type: 'account', id: 'ACCOUNT_ID_1' });
			urls.parse.withArgs('https://soundcloud.com/ACCOUNT_ID_2').returns({ api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID_2' });

			soundcloud.account({ id: 'ACCOUNT_ID' }, function(err, account) {
				expect(err).not.to.be.ok;
				expect(account.accounts).to.contain({ api: 'someapi', type: 'account', id: 'ACCOUNT_ID_1' });
				expect(account.accounts).to.contain({ api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID_2' });
				done();
			});
		});

		it('should reference account in website', function() {
			default_user.website = 'https://www.hovercards.com';
			resolve_endpoint.reply(302, null, { location: 'https://api.soundcloud.com/users/SOUNDCLOUD_USER_ID?client_id=SOUNDCLOUD_CLIENT_ID' });
			users_endpoint.reply(200, default_user);
			web_profiles_endpoint.reply(200, default_web_profiles);

			urls.parse.withArgs('https://www.hovercards.com').returns({ api: 'someapi', type: 'account', id: 'ACCOUNT_ID_1' });

			soundcloud.account({ id: 'ACCOUNT_ID' }, function(err, account) {
				expect(err).not.to.be.ok;
				expect(account.accounts).to.contain({ api: 'someapi', type: 'account', id: 'ACCOUNT_ID_1' });
				done();
			});
		});

		it('should reference accounts in web-profiles', function() {
			default_web_profiles.push({ url: 'https://www.hovercards.com' });
			default_web_profiles.push({ url: 'https://www.wenoknow.com' });
			resolve_endpoint.reply(302, null, { location: 'https://api.soundcloud.com/users/SOUNDCLOUD_USER_ID?client_id=SOUNDCLOUD_CLIENT_ID' });
			users_endpoint.reply(200, default_user);
			web_profiles_endpoint.reply(200, default_web_profiles);

			urls.parse.withArgs('https://www.hovercards.com').returns({ api: 'someapi', type: 'account', id: 'ACCOUNT_ID_1' });
			urls.parse.withArgs('https://www.wenoknow.com').returns({ api: 'someapi', type: 'account', id: 'ACCOUNT_ID_2' });

			soundcloud.account({ id: 'ACCOUNT_ID' }, function(err, account) {
				expect(err).not.to.be.ok;
				expect(account.accounts).to.contain({ api: 'someapi', type: 'account', id: 'ACCOUNT_ID_1' });
				expect(account.accounts).to.contain({ api: 'someapi', type: 'account', id: 'ACCOUNT_ID_2' });
				done();
			});
		});

		it('should replace newlines in the text with linebreaks', function() {
			default_user.description = 'TE\nXT 1';
			resolve_endpoint.reply(302, null, { location: 'https://api.soundcloud.com/users/SOUNDCLOUD_USER_ID?client_id=SOUNDCLOUD_CLIENT_ID' });
			users_endpoint.reply(200, default_user);
			web_profiles_endpoint.reply(200, default_web_profiles);

			soundcloud.account({ id: 'ACCOUNT_ID' }, function(err, account) {
				expect(err).not.to.be.ok;
				expect(account).to.have.property('text', 'TE<br>XT 1');
				done();
			});
		});

		it('should replace hashtags with links in the text', function() {
			default_user.description = '#thing #thing2';
			resolve_endpoint.reply(302, null, { location: 'https://api.soundcloud.com/users/SOUNDCLOUD_USER_ID?client_id=SOUNDCLOUD_CLIENT_ID' });
			users_endpoint.reply(200, default_user);
			web_profiles_endpoint.reply(200, default_web_profiles);

			soundcloud.account({ id: 'ACCOUNT_ID' }, function(err, account) {
				expect(err).not.to.be.ok;
				expect(account).to.have.property('text', '<a href="https://soundcloud.com/tags/thing" target="_blank" rel="noopener noreferrer">#thing</a> <a href="https://soundcloud.com/tags/thing2" target="_blank" rel="noopener noreferrer">#thing2</a>');
				done();
			});
		});

		it('should replace accounts with links in the text', function() {
			default_user.description = '@ACCOUNT_ID_1 @ACCOUNT_ID_2';
			resolve_endpoint.reply(302, null, { location: 'https://api.soundcloud.com/users/SOUNDCLOUD_USER_ID?client_id=SOUNDCLOUD_CLIENT_ID' });
			users_endpoint.reply(200, default_user);
			web_profiles_endpoint.reply(200, default_web_profiles);

			soundcloud.account({ id: 'ACCOUNT_ID' }, function(err, account) {
				expect(err).not.to.be.ok;
				expect(account).to.have.property('text', '<a href="https://soundcloud.com/ACCOUNT_ID_1" target="_blank" rel="noopener noreferrer">@ACCOUNT_ID_1</a> <a href="https://soundcloud.com/ACCOUNT_ID_2" target="_blank" rel="noopener noreferrer">@ACCOUNT_ID_2</a>');
				done();
			});
		});

		it('should remove the default image', function() {
			default_user.avatar_url = 'http://a1.sndcdn.com/images/default_avatar_large.png?142a848';
			resolve_endpoint.reply(302, null, { location: 'https://api.soundcloud.com/users/SOUNDCLOUD_USER_ID?client_id=SOUNDCLOUD_CLIENT_ID' });
			users_endpoint.reply(200, default_user);
			web_profiles_endpoint.reply(200, default_web_profiles);

			soundcloud.account({ id: 'ACCOUNT_ID' }, function(err, account) {
				expect(err).not.to.be.ok;
				expect(account).not.to.have.property('image');
				done();
			});
		});

		describe('resolve endpoint', function() {
			beforeEach(function() {
				users_endpoint.reply(200, default_user);
				web_profiles_endpoint.reply(200, default_web_profiles);
			});

			it('should 403 on 401', function() {
				resolve_endpoint.reply(401, '');

				soundcloud.account({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'SoundCloud Resolve', status: 403 });
					done();
				});
			});

			it('should 403 on 403', function() {
				resolve_endpoint.reply(403, '');

				soundcloud.account({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'SoundCloud Resolve', status: 403 });
					done();
				});
			});

			it('should 404 on 404', function() {
				resolve_endpoint.reply(404, '');

				soundcloud.account({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'SoundCloud Resolve', status: 404 });
					done();
				});
			});

			it('should 429 on 429', function() {
				resolve_endpoint.reply(429, '');

				soundcloud.account({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'SoundCloud Resolve', status: 429 });
					done();
				});
			});

			it('should 500 on 4xx', function() {
				resolve_endpoint.reply(478, '');

				soundcloud.account({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'SoundCloud Resolve', status: 500, original_status: 478 });
					done();
				});
			});

			it('should 502 on 5xx', function() {
				resolve_endpoint.reply(578, '');

				soundcloud.account({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'SoundCloud Resolve', status: 502, original_status: 578 });
					done();
				});
			});
		});

		describe('users endpoint', function() {
			beforeEach(function() {
				resolve_endpoint.reply(302, null, { location: 'https://api.soundcloud.com/users/SOUNDCLOUD_USER_ID?client_id=SOUNDCLOUD_CLIENT_ID' });
				web_profiles_endpoint.reply(200, default_web_profiles);
			});

			it('should 403 on 401', function() {
				users_endpoint.reply(401, '');

				soundcloud.account({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'SoundCloud Resolve', status: 403 });
					done();
				});
			});

			it('should 403 on 403', function() {
				users_endpoint.reply(403, '');

				soundcloud.account({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'SoundCloud Resolve', status: 403 });
					done();
				});
			});

			it('should 404 on 404', function() {
				users_endpoint.reply(404, '');

				soundcloud.account({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'SoundCloud Resolve', status: 404 });
					done();
				});
			});

			it('should 429 on 429', function() {
				users_endpoint.reply(429, '');

				soundcloud.account({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'SoundCloud Resolve', status: 429 });
					done();
				});
			});

			it('should 500 on 4xx', function() {
				users_endpoint.reply(478, '');

				soundcloud.account({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'SoundCloud Resolve', status: 500, original_status: 478 });
					done();
				});
			});

			it('should 502 on 5xx', function() {
				users_endpoint.reply(578, '');

				soundcloud.account({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'SoundCloud Resolve', status: 502, original_status: 578 });
					done();
				});
			});
		});

		describe('web profiles endpoint', function() {
			beforeEach(function() {
				resolve_endpoint.reply(302, null, { location: 'https://api.soundcloud.com/users/SOUNDCLOUD_USER_ID?client_id=SOUNDCLOUD_CLIENT_ID' });
				users_endpoint.reply(200, default_user);
			});

			it('should be fine on err', function() {
				web_profiles_endpoint.reply(404, '');

				soundcloud.account({ id: 'ACCOUNT_ID' }, function(err, account) {
					expect(err).not.to.be.ok;
					expect(account).to.be.ok;
					done();
				});
			});
		});
	});

	describe('.account_content', function() {
		var users_endpoint;
		var users_playlists_endpoint;
		var users_tracks_endpoint;
		var default_user;
		var default_users_playlists;
		var default_users_tracks;

		beforeEach(function() {
			resolve_endpoint = resolve_endpoint.query({ url: 'https://soundcloud.com/ACCOUNT_ID' });
			users_endpoint = nock('https://api.soundcloud.com')
				.get('/users/SOUNDCLOUD_USER_ID')
				.query({ client_id: 'SOUNDCLOUD_CLIENT_ID' });
			users_playlists_endpoint = nock('https://api.soundcloud.com')
				.get('/users/SOUNDCLOUD_USER_ID/playlists')
				.query({ client_id: 'SOUNDCLOUD_CLIENT_ID', representation: 'compact' });
			users_tracks_endpoint = nock('https://api.soundcloud.com')
				.get('/users/SOUNDCLOUD_USER_ID/tracks')
				.query({ client_id: 'SOUNDCLOUD_CLIENT_ID' });

			sandbox.stub(urls, 'parse');

			default_user = { id:               'SOUNDCLOUD_USER_ID', permalink:        'ACCOUNT_ID', username:         'NAME', avatar_url:       'image-large.jpg', description:      'TEXT', track_count:      1000, playlist_count:   2000, followers_count:  3000, followings_count: 4000 };
			default_users_playlists = [{ kind:        'playlist', created_at:  '2015/05/22 01:53:47 +0000', title:       'NAME PLAYLIST 1', permalink:   'CONTENT_ID_PLAYLIST_1', track_count: 1101, artwork_url: 'image-playlist-1-large.jpg', user:        { permalink: 'ACCOUNT_ID_PLAYLIST_1' } }, { kind:        'playlist', created_at:  '2015/05/20 01:53:47 +0000', title:       'NAME PLAYLIST 2', permalink:   'CONTENT_ID_PLAYLIST_2', track_count: 2101, artwork_url: 'image-playlist-2-large.jpg', user:        { permalink: 'ACCOUNT_ID_PLAYLIST_2' } }];
			default_users_tracks = [{ created_at:        '2015/05/21 01:53:47 +0000', permalink:         'CONTENT_ID_TRACK_1', title:             'NAME TRACK 1', artwork_url:       'image-track-1-large.jpg', user:              { permalink: 'ACCOUNT_ID_TRACK_1' }, playback_count:    1202, favoritings_count: 1201, comment_count:     1203 }, { created_at:        '2015/05/19 01:53:47 +0000', permalink:         'CONTENT_ID_TRACK_2', title:             'NAME TRACK 2', artwork_url:       'image-track-2-large.jpg', user:              { permalink: 'ACCOUNT_ID_TRACK_2' }, playback_count:    2202, favoritings_count: 2201, comment_count:     2203 }];
		});

		it('should callback soundcloud tracks and playlists', function() {
			resolve_endpoint.reply(302, null, { location: 'https://api.soundcloud.com/users/SOUNDCLOUD_USER_ID?client_id=SOUNDCLOUD_CLIENT_ID' });
			users_endpoint.reply(200, default_user);
			users_playlists_endpoint.reply(200, default_users_playlists);
			users_tracks_endpoint.reply(200, default_users_tracks);

			soundcloud.account_content({ id: 'ACCOUNT_ID' }, function(err, account_content) {
				expect(err).not.to.be.ok;
				expect(account_content).to.eql({ api:     'soundcloud', type:    'account_content', id:      'ACCOUNT_ID', content: [{ api:     'soundcloud', type:    'content', id:      'CONTENT_ID_PLAYLIST_1', as:      'playlist', name:    'NAME PLAYLIST 1', date:    1432259627000, image:   { small:  'image-playlist-1-large.jpg', medium: 'image-playlist-1-t300x300.jpg', large:  'image-playlist-1-t500x500.jpg' }, stats:   { content: 1101 }, account: { api:  'soundcloud', type: 'account', id:   'ACCOUNT_ID_PLAYLIST_1' } }, { api:     'soundcloud', type:    'content', id:      'CONTENT_ID_TRACK_1', name:    'NAME TRACK 1', date:    1432173227000, image:   { small:  'image-track-1-large.jpg', medium: 'image-track-1-t300x300.jpg', large:  'image-track-1-t500x500.jpg' }, stats:   { likes:    1201, views:    1202, comments: 1203 }, account: { api:  'soundcloud', type: 'account', id:   'ACCOUNT_ID_TRACK_1' } }, { api:     'soundcloud', type:    'content', id:      'CONTENT_ID_PLAYLIST_2', as:      'playlist', name:    'NAME PLAYLIST 2', date:    1432086827000, image:   { small:  'image-playlist-2-large.jpg', medium: 'image-playlist-2-t300x300.jpg', large:  'image-playlist-2-t500x500.jpg' }, stats:   { content: 2101 }, account: { api:  'soundcloud', type: 'account', id:   'ACCOUNT_ID_PLAYLIST_2' } }, { api:     'soundcloud', type:    'content', id:      'CONTENT_ID_TRACK_2', name:    'NAME TRACK 2', date:    1432000427000, image:   { small:  'image-track-2-large.jpg', medium: 'image-track-2-t300x300.jpg', large:  'image-track-2-t500x500.jpg' }, stats:   { likes:    2201, views:    2202, comments: 2203 }, account: { api:  'soundcloud', type: 'account', id:   'ACCOUNT_ID_TRACK_2' } }] });
				done();
			});
		});

		describe('usage', function() {
			it('should have nothing to report', function() {
				resolve_endpoint.reply(302, null, { location: 'https://api.soundcloud.com/users/SOUNDCLOUD_USER_ID?client_id=SOUNDCLOUD_CLIENT_ID' });
				users_endpoint.reply(200, default_user);
				users_playlists_endpoint.reply(200, default_users_playlists);
				users_tracks_endpoint.reply(200, default_users_tracks);

				soundcloud.account_content({ id: 'ACCOUNT_ID' }, function(err, account_content, usage) {
					expect(usage).to.be.empty;
					done();
				});
			});
		});

		describe('resolve endpoint', function() {
			beforeEach(function() {
				users_endpoint.reply(200, default_user);
				users_playlists_endpoint.reply(200, default_users_playlists);
				users_tracks_endpoint.reply(200, default_users_tracks);
			});

			it('should 403 on 401', function() {
				resolve_endpoint.reply(401, '');

				soundcloud.account_content({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'SoundCloud Resolve', status: 403 });
					done();
				});
			});

			it('should 403 on 403', function() {
				resolve_endpoint.reply(403, '');

				soundcloud.account_content({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'SoundCloud Resolve', status: 403 });
					done();
				});
			});

			it('should 404 on 404', function() {
				resolve_endpoint.reply(404, '');

				soundcloud.account_content({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'SoundCloud Resolve', status: 404 });
					done();
				});
			});

			it('should 429 on 429', function() {
				resolve_endpoint.reply(429, '');

				soundcloud.account_content({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'SoundCloud Resolve', status: 429 });
					done();
				});
			});

			it('should 500 on 4xx', function() {
				resolve_endpoint.reply(478, '');

				soundcloud.account_content({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'SoundCloud Resolve', status: 500, original_status: 478 });
					done();
				});
			});

			it('should 502 on 5xx', function() {
				resolve_endpoint.reply(578, '');

				soundcloud.account_content({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'SoundCloud Resolve', status: 502, original_status: 578 });
					done();
				});
			});
		});

		describe('users playlists endpoint', function() {
			beforeEach(function() {
				resolve_endpoint.reply(302, null, { location: 'https://api.soundcloud.com/users/SOUNDCLOUD_USER_ID?client_id=SOUNDCLOUD_CLIENT_ID' });
				users_endpoint.reply(200, default_user);
				users_tracks_endpoint.reply(200, default_users_tracks);
			});

			it('should 403 on 401', function() {
				users_playlists_endpoint.reply(401, '');

				soundcloud.account_content({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'SoundCloud Users Playlists', status: 403 });
					done();
				});
			});

			it('should 403 on 403', function() {
				users_playlists_endpoint.reply(403, '');

				soundcloud.account_content({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'SoundCloud Users Playlists', status: 403 });
					done();
				});
			});

			it('should 404 on 404', function() {
				users_playlists_endpoint.reply(404, '');

				soundcloud.account_content({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'SoundCloud Users Playlists', status: 404 });
					done();
				});
			});

			it('should 429 on 429', function() {
				users_playlists_endpoint.reply(429, '');

				soundcloud.account_content({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'SoundCloud Users Playlists', status: 429 });
					done();
				});
			});

			it('should 500 on 4xx', function() {
				users_playlists_endpoint.reply(478, '');

				soundcloud.account_content({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'SoundCloud Users Playlists', status: 500, original_status: 478 });
					done();
				});
			});

			it('should 502 on 5xx', function() {
				users_playlists_endpoint.reply(578, '');

				soundcloud.account_content({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'SoundCloud Users Playlists', status: 502, original_status: 578 });
					done();
				});
			});
		});

		describe('users tracks endpoint', function() {
			beforeEach(function() {
				resolve_endpoint.reply(302, null, { location: 'https://api.soundcloud.com/users/SOUNDCLOUD_USER_ID?client_id=SOUNDCLOUD_CLIENT_ID' });
				users_endpoint.reply(200, default_user);
				users_playlists_endpoint.reply(200, default_users_playlists);
			});

			it('should 403 on 401', function() {
				users_tracks_endpoint.reply(401, '');

				soundcloud.account_content({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'SoundCloud Users Tracks', status: 403 });
					done();
				});
			});

			it('should 403 on 403', function() {
				users_tracks_endpoint.reply(403, '');

				soundcloud.account_content({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'SoundCloud Users Tracks', status: 403 });
					done();
				});
			});

			it('should 404 on 404', function() {
				users_tracks_endpoint.reply(404, '');

				soundcloud.account_content({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'SoundCloud Users Tracks', status: 404 });
					done();
				});
			});

			it('should 429 on 429', function() {
				users_tracks_endpoint.reply(429, '');

				soundcloud.account_content({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'SoundCloud Users Tracks', status: 429 });
					done();
				});
			});

			it('should 500 on 4xx', function() {
				users_tracks_endpoint.reply(478, '');

				soundcloud.account_content({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'SoundCloud Users Tracks', status: 500, original_status: 478 });
					done();
				});
			});

			it('should 502 on 5xx', function() {
				users_tracks_endpoint.reply(578, '');

				soundcloud.account_content({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'SoundCloud Users Tracks', status: 502, original_status: 578 });
					done();
				});
			});
		});
	});
	*/
});
