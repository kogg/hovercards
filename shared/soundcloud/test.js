var chai      = require('chai');
var nock      = require('nock');
var sinon     = require('sinon');
var sinonChai = require('sinon-chai');
var expect    = chai.expect;
chai.use(sinonChai);

/*
 * So a lot of this is weird because CLIENT SIDE WE CAN'T STOP THE REDIRECTS FROM HAPPENING
 * So even for for comments, for example, we have to go grab the track. */

describe('soundcloud', function() {
	var resolve_endpoint;
	var sandbox;
	var soundcloud;
	var urls;

	/*
	before(function() {
		nock.recorder.rec();
	});
	*/

	beforeEach(function() {
		sandbox = sinon.sandbox.create();
		soundcloud = require('.')({ key: 'SOUNDCLOUD_CLIENT_ID' });
		urls = require('../urls');

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

			default_track = { id:                'SOUNDCLOUD_TRACK_ID',
			                  kind:              'track',
			                  created_at:        '2015/06/29 15:48:11 +0000',
			                  commentable:       true,
			                  permalink:         'CONTENT_ID',
			                  description:       'TEXT',
			                  title:             'NAME',
			                  artwork_url:       'image-large.jpg',
			                  user:              { permalink:  'ACCOUNT_ID',
			                                       username:   'ACCOUNT NAME',
			                                       avatar_url: 'account-image-large.jpg' },
			                  playback_count:    1002,
			                  favoritings_count: 1001,
			                  comment_count:     1003 };
		});

		describe('for a track', function() {
			beforeEach(function() {
				resolve_endpoint
					.query({ url: 'https://soundcloud.com/ACCOUNT_ID/CONTENT_ID' })
					.reply(302, null, { location: 'https://api.soundcloud.com/tracks/SOUNDCLOUD_TRACK_ID?client_id=SOUNDCLOUD_CLIENT_ID' });
			});

			it('should callback a soundcloud track', function(done) {
				tracks_endpoint.reply(200, default_track);

				soundcloud.content({ id: 'CONTENT_ID', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } }, function(err, content) {
					expect(err).not.to.be.ok;
					expect(content).to.eql({ api:     'soundcloud',
					                         type:    'content',
					                         id:      'CONTENT_ID',
					                         name:    'NAME',
					                         text:    'TEXT',
					                         date:    1435592891000,
					                         image:   { small:  'image-large.jpg',
					                                    medium: 'image-t300x300.jpg',
					                                    large:  'image-t500x500.jpg' },
					                         stats:   { likes:    1001,
					                                    views:    1002,
					                                    comments: 1003 },
					                         account: { api:   'soundcloud',
					                                    type:  'account',
					                                    id:    'ACCOUNT_ID',
					                                    name:  'ACCOUNT NAME',
					                                    image: { small:  'account-image-large.jpg',
					                                             medium: 'account-image-t300x300.jpg',
					                                             large:  'account-image-t500x500.jpg' } } });
					done();
				});
			});

			it('should callback with empty discussion when uncommentable', function(done) {
				default_track.commentable = false;
				tracks_endpoint.reply(200, default_track);

				soundcloud.content({ id: 'CONTENT_ID', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } }, function(err, content) {
					expect(err).not.to.be.ok;
					expect(content).to.have.property('discussions').that.eql([{ api: 'soundcloud', type: 'discussion', id: 'CONTENT_ID', uncommentable: true }]);
					done();
				});
			});

			it('should replace newlines with linebreaks in the text', function(done) {
				default_track.description = 'TE\nXT';
				tracks_endpoint.reply(200, default_track);

				soundcloud.content({ id: 'CONTENT_ID', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } }, function(err, content) {
					expect(err).not.to.be.ok;
					expect(content).to.have.property('text', 'TE<br>XT');
					done();
				});
			});

			it('should replace hashtags with links in the text', function(done) {
				default_track.description = '#thing #thing2';
				tracks_endpoint.reply(200, default_track);

				soundcloud.content({ id: 'CONTENT_ID', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } }, function(err, content) {
					expect(err).not.to.be.ok;
					expect(content).to.have.property('text', '<a href="https://soundcloud.com/tags/thing" target="_blank">#thing</a> <a href="https://soundcloud.com/tags/thing2" target="_blank">#thing2</a>');
					done();
				});
			});

			it('should replace accounts with links in the text', function(done) {
				default_track.description = '@ACCOUNT_ID_1 @ACCOUNT_ID_2';
				tracks_endpoint.reply(200, default_track);

				soundcloud.content({ id: 'CONTENT_ID', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } }, function(err, content) {
					expect(err).not.to.be.ok;
					expect(content).to.have.property('text', '<a href="https://soundcloud.com/ACCOUNT_ID_1" target="_blank">@ACCOUNT_ID_1</a> <a href="https://soundcloud.com/ACCOUNT_ID_2" target="_blank">@ACCOUNT_ID_2</a>');
					done();
				});
			});

			it('should remove the default image for account', function(done) {
				default_track.user.avatar_url = 'http://a1.sndcdn.com/images/default_avatar_large.png?142a848';
				tracks_endpoint.reply(200, default_track);

				soundcloud.content({ id: 'CONTENT_ID', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } }, function(err, content) {
					expect(err).not.to.be.ok;
					expect(content).not.to.have.deep.property('account.image');
					done();
				});
			});

			describe('tracks endpoint', function() {
				it('should 403 on 401', function(done) {
					tracks_endpoint.reply(401, '');

					soundcloud.content({ id: 'CONTENT_ID', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } }, function(err) {
						expect(err).to.eql({ message: 'SoundCloud Resolve', status: 403 });
						done();
					});
				});

				it('should 403 on 403', function(done) {
					tracks_endpoint.reply(403, '');

					soundcloud.content({ id: 'CONTENT_ID', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } }, function(err) {
						expect(err).to.eql({ message: 'SoundCloud Resolve', status: 403 });
						done();
					});
				});

				it('should 404 on 404', function(done) {
					tracks_endpoint.reply(404, '');

					soundcloud.content({ id: 'CONTENT_ID', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } }, function(err) {
						expect(err).to.eql({ message: 'SoundCloud Resolve', status: 404 });
						done();
					});
				});

				it('should 429 on 429', function(done) {
					tracks_endpoint.reply(429, '');

					soundcloud.content({ id: 'CONTENT_ID', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } }, function(err) {
						expect(err).to.eql({ message: 'SoundCloud Resolve', status: 429 });
						done();
					});
				});

				it('should 500 on 4xx', function(done) {
					tracks_endpoint.reply(478, '');

					soundcloud.content({ id: 'CONTENT_ID', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } }, function(err) {
						expect(err).to.eql({ message: 'SoundCloud Resolve', status: 500, original_status: 478 });
						done();
					});
				});

				it('should 502 on 5xx', function(done) {
					tracks_endpoint.reply(578, '');

					soundcloud.content({ id: 'CONTENT_ID', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } }, function(err) {
						expect(err).to.eql({ message: 'SoundCloud Resolve', status: 502, original_status: 578 });
						done();
					});
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

				default_playlist = { kind:        'playlist',
				                     created_at:  '2015/06/29 15:48:11 +0000',
				                     permalink:   'CONTENT_ID',
				                     description: 'TEXT',
				                     title:       'NAME',
				                     track_count: 1001,
				                     artwork_url: 'image-large.jpg',
				                     user:        { permalink:  'ACCOUNT_ID',
				                                    username:   'ACCOUNT NAME',
				                                    avatar_url: 'account-image-large.jpg' } };
			});

			it('should callback a soundcloud playlist', function(done) {
				playlists_endpoint.reply(200, default_playlist);

				soundcloud.content({ id: 'CONTENT_ID', as: 'playlist', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } }, function(err, content) {
					expect(err).not.to.be.ok;
					expect(content).to.eql({ api:         'soundcloud',
					                         type:        'content',
					                         id:          'CONTENT_ID',
					                         as:          'playlist',
					                         name:        'NAME',
					                         text:        'TEXT',
					                         date:        1435592891000,
					                         image:       { small:  'image-large.jpg',
					                                        medium: 'image-t300x300.jpg',
					                                        large:  'image-t500x500.jpg' },
					                         stats:       { content: 1001 },
					                         account:     { api:   'soundcloud',
					                                        type:  'account',
					                                        id:    'ACCOUNT_ID',
					                                        name:  'ACCOUNT NAME',
					                                        image: { small:  'account-image-large.jpg',
					                                                 medium: 'account-image-t300x300.jpg',
					                                                 large:  'account-image-t500x500.jpg' } },
					                         discussions: [{ api:           'soundcloud',
					                                         type:          'discussion',
					                                         id:            'CONTENT_ID',
					                                         uncommentable: true }] });
					done();
				});
			});

			it('should replace newlines with linebreaks in the text', function(done) {
				default_playlist.description = 'TE\nXT';
				playlists_endpoint.reply(200, default_playlist);

				soundcloud.content({ id: 'CONTENT_ID', as: 'playlist', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } }, function(err, content) {
					expect(err).not.to.be.ok;
					expect(content).to.have.property('text', 'TE<br>XT');
					done();
				});
			});

			it('should replace hashtags with links in the text', function(done) {
				default_playlist.description = '#thing #thing2';
				playlists_endpoint.reply(200, default_playlist);

				soundcloud.content({ id: 'CONTENT_ID', as: 'playlist', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } }, function(err, content) {
					expect(err).not.to.be.ok;
					expect(content).to.have.property('text', '<a href="https://soundcloud.com/tags/thing" target="_blank">#thing</a> <a href="https://soundcloud.com/tags/thing2" target="_blank">#thing2</a>');
					done();
				});
			});

			it('should replace accounts with links in the text', function(done) {
				default_playlist.description = '@ACCOUNT_ID_1 @ACCOUNT_ID_2';
				playlists_endpoint.reply(200, default_playlist);

				soundcloud.content({ id: 'CONTENT_ID', as: 'playlist', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } }, function(err, content) {
					expect(err).not.to.be.ok;
					expect(content).to.have.property('text', '<a href="https://soundcloud.com/ACCOUNT_ID_1" target="_blank">@ACCOUNT_ID_1</a> <a href="https://soundcloud.com/ACCOUNT_ID_2" target="_blank">@ACCOUNT_ID_2</a>');
					done();
				});
			});

			it('should remove the default image for account', function(done) {
				default_playlist.user.avatar_url = 'http://a1.sndcdn.com/images/default_avatar_large.png?142a848';
				playlists_endpoint.reply(200, default_playlist);

				soundcloud.content({ id: 'CONTENT_ID', as: 'playlist', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } }, function(err, content) {
					expect(err).not.to.be.ok;
					expect(content).not.to.have.deep.property('account.image');
					done();
				});
			});

			describe('playlists endpoint', function() {
				it('should 403 on 401', function(done) {
					playlists_endpoint.reply(401, '');

					soundcloud.content({ id: 'CONTENT_ID', as: 'playlist', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } }, function(err) {
						expect(err).to.eql({ message: 'SoundCloud Resolve', status: 403 });
						done();
					});
				});

				it('should 403 on 403', function(done) {
					playlists_endpoint.reply(403, '');

					soundcloud.content({ id: 'CONTENT_ID', as: 'playlist', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } }, function(err) {
						expect(err).to.eql({ message: 'SoundCloud Resolve', status: 403 });
						done();
					});
				});

				it('should 404 on 404', function(done) {
					playlists_endpoint.reply(404, '');

					soundcloud.content({ id: 'CONTENT_ID', as: 'playlist', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } }, function(err) {
						expect(err).to.eql({ message: 'SoundCloud Resolve', status: 404 });
						done();
					});
				});

				it('should 429 on 429', function(done) {
					playlists_endpoint.reply(429, '');

					soundcloud.content({ id: 'CONTENT_ID', as: 'playlist', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } }, function(err) {
						expect(err).to.eql({ message: 'SoundCloud Resolve', status: 429 });
						done();
					});
				});

				it('should 500 on 4xx', function(done) {
					playlists_endpoint.reply(478, '');

					soundcloud.content({ id: 'CONTENT_ID', as: 'playlist', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } }, function(err) {
						expect(err).to.eql({ message: 'SoundCloud Resolve', status: 500, original_status: 478 });
						done();
					});
				});

				it('should 502 on 5xx', function(done) {
					playlists_endpoint.reply(578, '');

					soundcloud.content({ id: 'CONTENT_ID', as: 'playlist', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } }, function(err) {
						expect(err).to.eql({ message: 'SoundCloud Resolve', status: 502, original_status: 578 });
						done();
					});
				});
			});
		});

		describe('usage', function() {
			it('should have nothing to report', function(done) {
				resolve_endpoint
					.query({ url: 'https://soundcloud.com/ACCOUNT_ID/CONTENT_ID' })
					.reply(302, null, { location: 'https://api.soundcloud.com/tracks/SOUNDCLOUD_TRACK_ID?client_id=SOUNDCLOUD_CLIENT_ID' });
				tracks_endpoint.reply(200, default_track);

				soundcloud.content({ id: 'CONTENT_ID', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } }, function(err, content, usage) {
					expect(usage).to.be.empty;
					done();
				});
			});
		});

		describe('resolve endpoint', function() {
			beforeEach(function() {
				resolve_endpoint = resolve_endpoint.query({ url: 'https://soundcloud.com/ACCOUNT_ID/CONTENT_ID' });
				tracks_endpoint.reply(200, default_track);
			});

			it('should 403 on 401', function(done) {
				resolve_endpoint.reply(401, '');

				soundcloud.content({ id: 'CONTENT_ID', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } }, function(err) {
					expect(err).to.eql({ message: 'SoundCloud Resolve', status: 403 });
					done();
				});
			});

			it('should 403 on 403', function(done) {
				resolve_endpoint.reply(403, '');

				soundcloud.content({ id: 'CONTENT_ID', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } }, function(err) {
					expect(err).to.eql({ message: 'SoundCloud Resolve', status: 403 });
					done();
				});
			});

			it('should 404 on 404', function(done) {
				resolve_endpoint.reply(404, '');

				soundcloud.content({ id: 'CONTENT_ID', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } }, function(err) {
					expect(err).to.eql({ message: 'SoundCloud Resolve', status: 404 });
					done();
				});
			});

			it('should 429 on 429', function(done) {
				resolve_endpoint.reply(429, '');

				soundcloud.content({ id: 'CONTENT_ID', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } }, function(err) {
					expect(err).to.eql({ message: 'SoundCloud Resolve', status: 429 });
					done();
				});
			});

			it('should 500 on 4xx', function(done) {
				resolve_endpoint.reply(478, '');

				soundcloud.content({ id: 'CONTENT_ID', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } }, function(err) {
					expect(err).to.eql({ message: 'SoundCloud Resolve', status: 500, original_status: 478 });
					done();
				});
			});

			it('should 502 on 5xx', function(done) {
				resolve_endpoint.reply(578, '');

				soundcloud.content({ id: 'CONTENT_ID', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } }, function(err) {
					expect(err).to.eql({ message: 'SoundCloud Resolve', status: 502, original_status: 578 });
					done();
				});
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

			default_track = { id:                'SOUNDCLOUD_TRACK_ID',
			                  kind:              'track',
			                  created_at:        '2015/06/29 15:48:11 +0000',
			                  commentable:       true,
			                  permalink:         'CONTENT_ID',
			                  description:       'TEXT',
			                  title:             'NAME',
			                  artwork_url:       'image-large.jpg',
			                  user:              { permalink:  'ACCOUNT_ID',
			                                       username:   'ACCOUNT NAME',
			                                       avatar_url: 'account-image-large.jpg' },
			                  playback_count:    1002,
			                  favoritings_count: 1001,
			                  comment_count:     1003 };
			default_tracks_comments = [{ id:         'SOUNDCLOUD_COMMENT_ID_1',
			                             created_at: '2015/04/28 03:37:27 +0000',
			                             timestamp:  1000,
			                             body:       'TEXT 1',
			                             user:       { permalink:  'ACCOUNT_ID_1',
			                                           username:   'NAME 1',
			                                           avatar_url: 'image-1-large.jpg' } },
			                           { id:         'SOUNDCLOUD_COMMENT_ID_2',
			                             created_at: '2015/04/27 03:37:27 +0000',
			                             timestamp:  2000,
			                             body:       'TEXT 2',
			                             user:       { permalink:  'ACCOUNT_ID_2',
			                                           username:   'NAME 2',
			                                           avatar_url: 'image-2-large.jpg' } }];
		});

		it('should callback soundcloud comments', function(done) {
			resolve_endpoint.reply(302, null, { location: 'https://api.soundcloud.com/tracks/SOUNDCLOUD_TRACK_ID?client_id=SOUNDCLOUD_CLIENT_ID' });
			tracks_endpoint.reply(200, default_track);
			tracks_comments_endpoint.reply(200, default_tracks_comments);

			soundcloud.discussion({ id: 'CONTENT_ID', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } }, function(err, discussion) {
				expect(err).not.to.be.ok;
				expect(discussion).to.eql({ api:      'soundcloud',
				                            type:     'discussion',
				                            id:       'CONTENT_ID',
				                            comments: [{ api:         'soundcloud',
				                                         type:        'comment',
				                                         id:          'SOUNDCLOUD_COMMENT_ID_1',
				                                         text:        'TEXT 1',
				                                         date:        1430192247000,
				                                         time_offset: 1000,
				                                         account:     { api:   'soundcloud',
				                                                        type:  'account',
				                                                        id:    'ACCOUNT_ID_1',
				                                                        name:  'NAME 1',
				                                                        image: { small:  'image-1-large.jpg',
				                                                                 medium: 'image-1-t300x300.jpg',
				                                                                 large:  'image-1-t500x500.jpg' } } },
				                                       { api:         'soundcloud',
				                                         type:        'comment',
				                                         id:          'SOUNDCLOUD_COMMENT_ID_2',
				                                         text:        'TEXT 2',
				                                         date:        1430105847000,
				                                         time_offset: 2000,
				                                         account:     { api:   'soundcloud',
				                                                        type:  'account',
				                                                        id:    'ACCOUNT_ID_2',
				                                                        name:  'NAME 2',
				                                                        image: { small:  'image-2-large.jpg',
				                                                                 medium: 'image-2-t300x300.jpg',
				                                                                 large:  'image-2-t500x500.jpg' } } }] });
				done();
			});
		});

		it('should replace newlines with linebreaks in the text', function(done) {
			default_tracks_comments[0].body = 'TEXT\n1';
			default_tracks_comments[1].body = 'TEXT\n2';
			resolve_endpoint.reply(302, null, { location: 'https://api.soundcloud.com/tracks/SOUNDCLOUD_TRACK_ID?client_id=SOUNDCLOUD_CLIENT_ID' });
			tracks_endpoint.reply(200, default_track);
			tracks_comments_endpoint.reply(200, default_tracks_comments);

			soundcloud.discussion({ id: 'CONTENT_ID', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } }, function(err, discussion) {
				expect(err).not.to.be.ok;
				expect(discussion).to.have.deep.property('comments[0].text', 'TEXT<br>1');
				expect(discussion).to.have.deep.property('comments[1].text', 'TEXT<br>2');
				done();
			});
		});

		it('should replace hashtags with links in the text', function(done) {
			default_tracks_comments[0].body = '#thing';
			default_tracks_comments[1].body = '#thing2';
			resolve_endpoint.reply(302, null, { location: 'https://api.soundcloud.com/tracks/SOUNDCLOUD_TRACK_ID?client_id=SOUNDCLOUD_CLIENT_ID' });
			tracks_endpoint.reply(200, default_track);
			tracks_comments_endpoint.reply(200, default_tracks_comments);

			soundcloud.discussion({ id: 'CONTENT_ID', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } }, function(err, discussion) {
				expect(err).not.to.be.ok;
				expect(discussion).to.have.deep.property('comments[0].text', '<a href="https://soundcloud.com/tags/thing" target="_blank">#thing</a>');
				expect(discussion).to.have.deep.property('comments[1].text', '<a href="https://soundcloud.com/tags/thing2" target="_blank">#thing2</a>');
				done();
			});
		});

		it('should replace accounts with links in the text', function(done) {
			default_tracks_comments[0].body = '@ACCOUNT_ID_1';
			default_tracks_comments[1].body = '@ACCOUNT_ID_2';
			resolve_endpoint.reply(302, null, { location: 'https://api.soundcloud.com/tracks/SOUNDCLOUD_TRACK_ID?client_id=SOUNDCLOUD_CLIENT_ID' });
			tracks_endpoint.reply(200, default_track);
			tracks_comments_endpoint.reply(200, default_tracks_comments);

			soundcloud.discussion({ id: 'CONTENT_ID', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } }, function(err, discussion) {
				expect(err).not.to.be.ok;
				expect(discussion).to.have.deep.property('comments[0].text', '<a href="https://soundcloud.com/ACCOUNT_ID_1" target="_blank">@ACCOUNT_ID_1</a>');
				expect(discussion).to.have.deep.property('comments[1].text', '<a href="https://soundcloud.com/ACCOUNT_ID_2" target="_blank">@ACCOUNT_ID_2</a>');
				done();
			});
		});

		it('should remove the default image for accounts', function(done) {
			default_tracks_comments[0].user.avatar_url = 'http://a1.sndcdn.com/images/default_avatar_large.png?142a848';
			default_tracks_comments[1].user.avatar_url = 'http://a1.sndcdn.com/images/default_avatar_large.png?142a848';
			resolve_endpoint.reply(302, null, { location: 'https://api.soundcloud.com/tracks/SOUNDCLOUD_TRACK_ID?client_id=SOUNDCLOUD_CLIENT_ID' });
			tracks_endpoint.reply(200, default_track);
			tracks_comments_endpoint.reply(200, default_tracks_comments);

			soundcloud.discussion({ id: 'CONTENT_ID', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } }, function(err, discussion) {
				expect(err).not.to.be.ok;
				expect(discussion).to.not.have.deep.property('comments[0].user.image');
				expect(discussion).to.not.have.deep.property('comments[1].user.image');
				done();
			});
		});

		describe('usage', function() {
			it('should have nothing to report', function(done) {
				resolve_endpoint.reply(302, null, { location: 'https://api.soundcloud.com/tracks/SOUNDCLOUD_TRACK_ID?client_id=SOUNDCLOUD_CLIENT_ID' });
				tracks_endpoint.reply(200, default_track);
				tracks_comments_endpoint.reply(200, default_tracks_comments);

				soundcloud.discussion({ id: 'CONTENT_ID', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } }, function(err, discussion, usage) {
					expect(usage).to.be.empty;
					done();
				});
			});
		});

		describe('resolve endpoint', function() {
			beforeEach(function() {
				tracks_endpoint.reply(200, default_track);
				tracks_comments_endpoint.reply(200, default_tracks_comments);
			});

			it('should 403 on 401', function(done) {
				resolve_endpoint.reply(401, '');

				soundcloud.discussion({ id: 'CONTENT_ID', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } }, function(err) {
					expect(err).to.eql({ message: 'SoundCloud Resolve', status: 403 });
					done();
				});
			});

			it('should 403 on 403', function(done) {
				resolve_endpoint.reply(403, '');

				soundcloud.discussion({ id: 'CONTENT_ID', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } }, function(err) {
					expect(err).to.eql({ message: 'SoundCloud Resolve', status: 403 });
					done();
				});
			});

			it('should 404 on 404', function(done) {
				resolve_endpoint.reply(404, '');

				soundcloud.discussion({ id: 'CONTENT_ID', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } }, function(err) {
					expect(err).to.eql({ message: 'SoundCloud Resolve', status: 404 });
					done();
				});
			});

			it('should 429 on 429', function(done) {
				resolve_endpoint.reply(429, '');

				soundcloud.discussion({ id: 'CONTENT_ID', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } }, function(err) {
					expect(err).to.eql({ message: 'SoundCloud Resolve', status: 429 });
					done();
				});
			});

			it('should 500 on 4xx', function(done) {
				resolve_endpoint.reply(478, '');

				soundcloud.discussion({ id: 'CONTENT_ID', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } }, function(err) {
					expect(err).to.eql({ message: 'SoundCloud Resolve', status: 500, original_status: 478 });
					done();
				});
			});

			it('should 502 on 5xx', function(done) {
				resolve_endpoint.reply(578, '');

				soundcloud.discussion({ id: 'CONTENT_ID', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } }, function(err) {
					expect(err).to.eql({ message: 'SoundCloud Resolve', status: 502, original_status: 578 });
					done();
				});
			});
		});

		describe('tracks comments endpoint', function() {
			beforeEach(function() {
				resolve_endpoint.reply(302, null, { location: 'https://api.soundcloud.com/tracks/SOUNDCLOUD_TRACK_ID?client_id=SOUNDCLOUD_CLIENT_ID' });
				tracks_endpoint.reply(200, default_track);
			});

			it('should 403 on 401', function(done) {
				tracks_comments_endpoint.reply(401, '');

				soundcloud.discussion({ id: 'CONTENT_ID', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } }, function(err) {
					expect(err).to.eql({ message: 'SoundCloud Tracks Comments', status: 403 });
					done();
				});
			});

			it('should 403 on 403', function(done) {
				tracks_comments_endpoint.reply(403, '');

				soundcloud.discussion({ id: 'CONTENT_ID', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } }, function(err) {
					expect(err).to.eql({ message: 'SoundCloud Tracks Comments', status: 403 });
					done();
				});
			});

			it('should 404 on 404', function(done) {
				tracks_comments_endpoint.reply(404, '');

				soundcloud.discussion({ id: 'CONTENT_ID', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } }, function(err) {
					expect(err).to.eql({ message: 'SoundCloud Tracks Comments', status: 404 });
					done();
				});
			});

			it('should 429 on 429', function(done) {
				tracks_comments_endpoint.reply(429, '');

				soundcloud.discussion({ id: 'CONTENT_ID', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } }, function(err) {
					expect(err).to.eql({ message: 'SoundCloud Tracks Comments', status: 429 });
					done();
				});
			});

			it('should 500 on 4xx', function(done) {
				tracks_comments_endpoint.reply(478, '');

				soundcloud.discussion({ id: 'CONTENT_ID', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } }, function(err) {
					expect(err).to.eql({ message: 'SoundCloud Tracks Comments', status: 500, original_status: 478 });
					done();
				});
			});

			it('should 502 on 5xx', function(done) {
				tracks_comments_endpoint.reply(578, '');

				soundcloud.discussion({ id: 'CONTENT_ID', account: { api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID' } }, function(err) {
					expect(err).to.eql({ message: 'SoundCloud Tracks Comments', status: 502, original_status: 578 });
					done();
				});
			});
		});
	});

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

			default_user = { id:               'SOUNDCLOUD_USER_ID',
			                 permalink:        'ACCOUNT_ID',
			                 username:         'NAME',
			                 avatar_url:       'image-large.jpg',
			                 description:      'TEXT',
			                 track_count:      1000,
			                 followers_count:  2000,
			                 followings_count: 3000 };
			default_web_profiles = [];
		});

		it('should callback soundcloud user', function(done) {
			resolve_endpoint.reply(302, null, { location: 'https://api.soundcloud.com/users/SOUNDCLOUD_USER_ID?client_id=SOUNDCLOUD_CLIENT_ID' });
			users_endpoint.reply(200, default_user);
			web_profiles_endpoint.reply(200, default_web_profiles);

			soundcloud.account({ id: 'ACCOUNT_ID' }, function(err, account) {
				expect(err).not.to.be.ok;
				expect(account).to.eql({ api:   'soundcloud',
				                         type:  'account',
				                         id:    'ACCOUNT_ID',
				                         name:  'NAME',
				                         text:  'TEXT',
				                         image: { small:  'image-large.jpg',
				                                  medium: 'image-t300x300.jpg',
				                                  large:  'image-t500x500.jpg' },
				                         stats: { content:   1000,
				                                  followers: 2000,
				                                  following: 3000 } });
				done();
			});
		});

		it('should reference accounts in text', function(done) {
			default_user.description = 'https://www.hovercards.com @ACCOUNT_ID_2';
			resolve_endpoint.reply(302, null, { location: 'https://api.soundcloud.com/users/SOUNDCLOUD_USER_ID?client_id=SOUNDCLOUD_CLIENT_ID' });
			users_endpoint.reply(200, default_user);
			web_profiles_endpoint.reply(200, default_web_profiles);

			urls.parse.withArgs('https://www.hovercards.com').returns({ api: 'someapi', type: 'account', id: 'ACCOUNT_ID_1' });
			urls.parse.withArgs('https://soundcloud.com/ACCOUNT_ID_2').returns({ api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID_2' });

			soundcloud.account({ id: 'ACCOUNT_ID' }, function(err, account) {
				expect(err).not.to.be.ok;
				expect(account.accounts).to.contain({ api: 'someapi',    type: 'account', id: 'ACCOUNT_ID_1' });
				expect(account.accounts).to.contain({ api: 'soundcloud', type: 'account', id: 'ACCOUNT_ID_2' });
				done();
			});
		});

		it('should reference account in website', function(done) {
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

		it('should reference accounts in web-profiles', function(done) {
			default_web_profiles.push({ url: 'https://www.hovercards.com' });
			default_web_profiles.push({ url: 'https://www.wenoknow.com' });
			resolve_endpoint.reply(302, null, { location: 'https://api.soundcloud.com/users/SOUNDCLOUD_USER_ID?client_id=SOUNDCLOUD_CLIENT_ID' });
			users_endpoint.reply(200, default_user);
			web_profiles_endpoint.reply(200, default_web_profiles);

			urls.parse.withArgs('https://www.hovercards.com').returns({ api: 'someapi', type: 'account', id: 'ACCOUNT_ID_1' });
			urls.parse.withArgs('https://www.wenoknow.com').returns({ api: 'someapi', type: 'account', id: 'ACCOUNT_ID_2' });

			soundcloud.account({ id: 'ACCOUNT_ID' }, function(err, account) {
				expect(err).not.to.be.ok;
				expect(account.accounts).to.contain({ api: 'someapi',   type: 'account', id: 'ACCOUNT_ID_1' });
				expect(account.accounts).to.contain({ api: 'someapi',   type: 'account', id: 'ACCOUNT_ID_2' });
				done();
			});
		});

		it('should replace newlines in the text with linebreaks', function(done) {
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

		it('should replace hashtags with links in the text', function(done) {
			default_user.description = '#thing #thing2';
			resolve_endpoint.reply(302, null, { location: 'https://api.soundcloud.com/users/SOUNDCLOUD_USER_ID?client_id=SOUNDCLOUD_CLIENT_ID' });
			users_endpoint.reply(200, default_user);
			web_profiles_endpoint.reply(200, default_web_profiles);

			soundcloud.account({ id: 'ACCOUNT_ID' }, function(err, account) {
				expect(err).not.to.be.ok;
				expect(account).to.have.property('text', '<a href="https://soundcloud.com/tags/thing" target="_blank">#thing</a> <a href="https://soundcloud.com/tags/thing2" target="_blank">#thing2</a>');
				done();
			});
		});

		it('should replace accounts with links in the text', function(done) {
			default_user.description = '@ACCOUNT_ID_1 @ACCOUNT_ID_2';
			resolve_endpoint.reply(302, null, { location: 'https://api.soundcloud.com/users/SOUNDCLOUD_USER_ID?client_id=SOUNDCLOUD_CLIENT_ID' });
			users_endpoint.reply(200, default_user);
			web_profiles_endpoint.reply(200, default_web_profiles);

			soundcloud.account({ id: 'ACCOUNT_ID' }, function(err, account) {
				expect(err).not.to.be.ok;
				expect(account).to.have.property('text', '<a href="https://soundcloud.com/ACCOUNT_ID_1" target="_blank">@ACCOUNT_ID_1</a> <a href="https://soundcloud.com/ACCOUNT_ID_2" target="_blank">@ACCOUNT_ID_2</a>');
				done();
			});
		});

		it('should remove the default image', function(done) {
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

			it('should 403 on 401', function(done) {
				resolve_endpoint.reply(401, '');

				soundcloud.account({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'SoundCloud Resolve', status: 403 });
					done();
				});
			});

			it('should 403 on 403', function(done) {
				resolve_endpoint.reply(403, '');

				soundcloud.account({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'SoundCloud Resolve', status: 403 });
					done();
				});
			});

			it('should 404 on 404', function(done) {
				resolve_endpoint.reply(404, '');

				soundcloud.account({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'SoundCloud Resolve', status: 404 });
					done();
				});
			});

			it('should 429 on 429', function(done) {
				resolve_endpoint.reply(429, '');

				soundcloud.account({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'SoundCloud Resolve', status: 429 });
					done();
				});
			});

			it('should 500 on 4xx', function(done) {
				resolve_endpoint.reply(478, '');

				soundcloud.account({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'SoundCloud Resolve', status: 500, original_status: 478 });
					done();
				});
			});

			it('should 502 on 5xx', function(done) {
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

			it('should 403 on 401', function(done) {
				users_endpoint.reply(401, '');

				soundcloud.account({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'SoundCloud Resolve', status: 403 });
					done();
				});
			});

			it('should 403 on 403', function(done) {
				users_endpoint.reply(403, '');

				soundcloud.account({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'SoundCloud Resolve', status: 403 });
					done();
				});
			});

			it('should 404 on 404', function(done) {
				users_endpoint.reply(404, '');

				soundcloud.account({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'SoundCloud Resolve', status: 404 });
					done();
				});
			});

			it('should 429 on 429', function(done) {
				users_endpoint.reply(429, '');

				soundcloud.account({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'SoundCloud Resolve', status: 429 });
					done();
				});
			});

			it('should 500 on 4xx', function(done) {
				users_endpoint.reply(478, '');

				soundcloud.account({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'SoundCloud Resolve', status: 500, original_status: 478 });
					done();
				});
			});

			it('should 502 on 5xx', function(done) {
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

			it('should be fine on err', function(done) {
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

			default_user = { id:               'SOUNDCLOUD_USER_ID',
			                 permalink:        'ACCOUNT_ID',
			                 username:         'NAME',
			                 avatar_url:       'image-large.jpg',
			                 description:      'TEXT',
			                 track_count:      1000,
			                 playlist_count:   2000,
			                 followers_count:  3000,
			                 followings_count: 4000 };
			default_users_playlists = [{ kind:        'playlist',
			                             created_at:  '2015/05/22 01:53:47 +0000',
			                             title:       'NAME PLAYLIST 1',
			                             permalink:   'CONTENT_ID_PLAYLIST_1',
			                             track_count: 1101,
			                             artwork_url: 'image-playlist-1-large.jpg',
			                             user:        { permalink: 'ACCOUNT_ID_PLAYLIST_1' } },
			                           { kind:        'playlist',
			                             created_at:  '2015/05/20 01:53:47 +0000',
			                             title:       'NAME PLAYLIST 2',
			                             permalink:   'CONTENT_ID_PLAYLIST_2',
			                             track_count: 2101,
			                             artwork_url: 'image-playlist-2-large.jpg',
			                             user:        { permalink: 'ACCOUNT_ID_PLAYLIST_2' } }];
			default_users_tracks = [{ created_at:        '2015/05/21 01:53:47 +0000',
			                          permalink:         'CONTENT_ID_TRACK_1',
			                          title:             'NAME TRACK 1',
			                          artwork_url:       'image-track-1-large.jpg',
			                          user:              { permalink: 'ACCOUNT_ID_TRACK_1' },
			                          playback_count:    1202,
			                          favoritings_count: 1201,
			                          comment_count:     1203 },
			                        { created_at:        '2015/05/19 01:53:47 +0000',
			                          permalink:         'CONTENT_ID_TRACK_2',
			                          title:             'NAME TRACK 2',
			                          artwork_url:       'image-track-2-large.jpg',
			                          user:              { permalink: 'ACCOUNT_ID_TRACK_2' },
			                          playback_count:    2202,
			                          favoritings_count: 2201,
			                          comment_count:     2203 }];
		});

		it('should callback soundcloud tracks and playlists', function(done) {
			resolve_endpoint.reply(302, null, { location: 'https://api.soundcloud.com/users/SOUNDCLOUD_USER_ID?client_id=SOUNDCLOUD_CLIENT_ID' });
			users_endpoint.reply(200, default_user);
			users_playlists_endpoint.reply(200, default_users_playlists);
			users_tracks_endpoint.reply(200, default_users_tracks);

			soundcloud.account_content({ id: 'ACCOUNT_ID' }, function(err, account_content) {
				expect(err).not.to.be.ok;
				expect(account_content).to.eql({ api:     'soundcloud',
				                                 type:    'account_content',
				                                 id:      'ACCOUNT_ID',
				                                 content: [{ api:     'soundcloud',
				                                             type:    'content',
				                                             id:      'CONTENT_ID_PLAYLIST_1',
				                                             as:      'playlist',
				                                             name:    'NAME PLAYLIST 1',
				                                             date:    1432259627000,
				                                             image:   { small:  'image-playlist-1-large.jpg',
				                                                        medium: 'image-playlist-1-t300x300.jpg',
				                                                        large:  'image-playlist-1-t500x500.jpg' },
				                                             stats:   { content: 1101 },
				                                             account: { api:  'soundcloud',
				                                                        type: 'account',
				                                                        id:   'ACCOUNT_ID_PLAYLIST_1' } },
				                                           { api:     'soundcloud',
				                                             type:    'content',
				                                             id:      'CONTENT_ID_TRACK_1',
				                                             name:    'NAME TRACK 1',
				                                             date:    1432173227000,
				                                             image:   { small:  'image-track-1-large.jpg',
				                                                        medium: 'image-track-1-t300x300.jpg',
				                                                        large:  'image-track-1-t500x500.jpg' },
				                                             stats:   { likes:    1201,
				                                                        views:    1202,
				                                                        comments: 1203 },
				                                             account: { api:  'soundcloud',
				                                                        type: 'account',
				                                                        id:   'ACCOUNT_ID_TRACK_1' } },
				                                           { api:     'soundcloud',
				                                             type:    'content',
				                                             id:      'CONTENT_ID_PLAYLIST_2',
				                                             as:      'playlist',
				                                             name:    'NAME PLAYLIST 2',
				                                             date:    1432086827000,
				                                             image:   { small:  'image-playlist-2-large.jpg',
				                                                        medium: 'image-playlist-2-t300x300.jpg',
				                                                        large:  'image-playlist-2-t500x500.jpg' },
				                                             stats:   { content: 2101 },
				                                             account: { api:  'soundcloud',
				                                                        type: 'account',
				                                                        id:   'ACCOUNT_ID_PLAYLIST_2' } },
				                                           { api:     'soundcloud',
				                                             type:    'content',
				                                             id:      'CONTENT_ID_TRACK_2',
				                                             name:    'NAME TRACK 2',
				                                             date:    1432000427000,
				                                             image:   { small:  'image-track-2-large.jpg',
				                                                        medium: 'image-track-2-t300x300.jpg',
				                                                        large:  'image-track-2-t500x500.jpg' },
				                                             stats:   { likes:    2201,
				                                                        views:    2202,
				                                                        comments: 2203 },
				                                             account: { api:  'soundcloud',
				                                                        type: 'account',
				                                                        id:   'ACCOUNT_ID_TRACK_2' } }] });
				done();
			});
		});

		describe('usage', function() {
			it('should have nothing to report', function(done) {
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

			it('should 403 on 401', function(done) {
				resolve_endpoint.reply(401, '');

				soundcloud.account_content({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'SoundCloud Resolve', status: 403 });
					done();
				});
			});

			it('should 403 on 403', function(done) {
				resolve_endpoint.reply(403, '');

				soundcloud.account_content({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'SoundCloud Resolve', status: 403 });
					done();
				});
			});

			it('should 404 on 404', function(done) {
				resolve_endpoint.reply(404, '');

				soundcloud.account_content({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'SoundCloud Resolve', status: 404 });
					done();
				});
			});

			it('should 429 on 429', function(done) {
				resolve_endpoint.reply(429, '');

				soundcloud.account_content({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'SoundCloud Resolve', status: 429 });
					done();
				});
			});

			it('should 500 on 4xx', function(done) {
				resolve_endpoint.reply(478, '');

				soundcloud.account_content({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'SoundCloud Resolve', status: 500, original_status: 478 });
					done();
				});
			});

			it('should 502 on 5xx', function(done) {
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

			it('should 403 on 401', function(done) {
				users_playlists_endpoint.reply(401, '');

				soundcloud.account_content({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'SoundCloud Users Playlists', status: 403 });
					done();
				});
			});

			it('should 403 on 403', function(done) {
				users_playlists_endpoint.reply(403, '');

				soundcloud.account_content({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'SoundCloud Users Playlists', status: 403 });
					done();
				});
			});

			it('should 404 on 404', function(done) {
				users_playlists_endpoint.reply(404, '');

				soundcloud.account_content({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'SoundCloud Users Playlists', status: 404 });
					done();
				});
			});

			it('should 429 on 429', function(done) {
				users_playlists_endpoint.reply(429, '');

				soundcloud.account_content({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'SoundCloud Users Playlists', status: 429 });
					done();
				});
			});

			it('should 500 on 4xx', function(done) {
				users_playlists_endpoint.reply(478, '');

				soundcloud.account_content({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'SoundCloud Users Playlists', status: 500, original_status: 478 });
					done();
				});
			});

			it('should 502 on 5xx', function(done) {
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

			it('should 403 on 401', function(done) {
				users_tracks_endpoint.reply(401, '');

				soundcloud.account_content({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'SoundCloud Users Tracks', status: 403 });
					done();
				});
			});

			it('should 403 on 403', function(done) {
				users_tracks_endpoint.reply(403, '');

				soundcloud.account_content({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'SoundCloud Users Tracks', status: 403 });
					done();
				});
			});

			it('should 404 on 404', function(done) {
				users_tracks_endpoint.reply(404, '');

				soundcloud.account_content({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'SoundCloud Users Tracks', status: 404 });
					done();
				});
			});

			it('should 429 on 429', function(done) {
				users_tracks_endpoint.reply(429, '');

				soundcloud.account_content({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'SoundCloud Users Tracks', status: 429 });
					done();
				});
			});

			it('should 500 on 4xx', function(done) {
				users_tracks_endpoint.reply(478, '');

				soundcloud.account_content({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'SoundCloud Users Tracks', status: 500, original_status: 478 });
					done();
				});
			});

			it('should 502 on 5xx', function(done) {
				users_tracks_endpoint.reply(578, '');

				soundcloud.account_content({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'SoundCloud Users Tracks', status: 502, original_status: 578 });
					done();
				});
			});
		});
	});
});

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
					.to.eql({ api:     'soundcloud',
					          type:    'content',
					          id:      'CONTENT_ID',
					          account: { api:  'soundcloud',
					                     type: 'account',
					                     id:   'ACCOUNT_ID' } });
			});

			it('from soundcloud.com/ACCOUNT_ID/CONTENT_ID/*', function() {
				expect(urls.parse(url.parse('https://www.soundcloud.com/ACCOUNT_ID/CONTENT_ID/likes', true, true)))
					.to.eql({ api:     'soundcloud',
					          type:    'content',
					          id:      'CONTENT_ID',
					          account: { api:  'soundcloud',
					                     type: 'account',
					                     id:   'ACCOUNT_ID' } });
			});

			it('from soundcloud.com/ACCOUNT_ID/sets/CONTENT_ID', function() {
				expect(urls.parse(url.parse('https://www.soundcloud.com/ACCOUNT_ID/sets/CONTENT_ID', true, true)))
					.to.eql({ api:     'soundcloud',
					          type:    'content',
					          id:      'CONTENT_ID',
					          as:      'playlist',
					          account: { api:  'soundcloud',
					                     type: 'account',
					                     id:   'ACCOUNT_ID' } });
			});

			it('from soundcloud.com/ACCOUNT_ID/sets/CONTENT_ID/*', function() {
				expect(urls.parse(url.parse('https://www.soundcloud.com/ACCOUNT_ID/sets/CONTENT_ID/likes', true, true)))
					.to.eql({ api:     'soundcloud',
					          type:    'content',
					          id:      'CONTENT_ID',
					          as:      'playlist',
					          account: { api:  'soundcloud',
					                     type: 'account',
					                     id:   'ACCOUNT_ID' } });
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
