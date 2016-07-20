var config    = require('../config');
var _         = require('underscore');
var chai      = require('chai');
var nock      = require('nock');
var sinon     = require('sinon');
var sinonChai = require('sinon-chai');
var expect    = chai.expect;
chai.use(sinonChai);

describe('twitter', function() {
	var sandbox;
	var secrets;
	var twitter;
	var urls;

	/*
	before(function() {
		nock.recorder.rec();
	});
	*/

	beforeEach(function() {
		sandbox = sinon.sandbox.create();
		secrets = { TWITTER_USER: 'TWITTER_SECRET' };
		twitter = require('.')({
			key:             'TWITTER_CONSUMER_KEY',
			secret:          'TWITTER_CONSUMER_SECRET',
			app_user:        'APP_TOKEN',
			app_user_secret: 'APP_TOKEN_SECRET',
			secret_storage:  {
				get: function(key, callback) { callback(null, secrets[key]); },
				set: function(key, value, callback) { secrets[key] = value; callback(null, 'OK'); },
				del: function() { _.chain(arguments).initial().each(function(key) { delete secrets[key]; }); _.last(arguments)(null, arguments.length - 1); }
			}
		});
		urls = require('../urls');
	});

	afterEach(function() {
		nock.cleanAll();
		sandbox.restore();
	});

	describe('.content', function() {
		var statuses_show_endpoint;
		var default_statuses_show;

		beforeEach(function() {
			statuses_show_endpoint = nock('https://api.twitter.com', { reqheaders: { Authorization: /^OAuth.*oauth_consumer_key="TWITTER_CONSUMER_KEY".*oauth_token="APP_TOKEN".*$/ } })
				.get('/1.1/statuses/show/CONTENT_ID.json');

			default_statuses_show = { created_at:     'Wed Jun 05 20:07:10 +0000 2012', id_str:         'CONTENT_ID', text:           'TEXT', retweet_count:  1002, favorite_count: 1001, user:           { screen_name:             'ACCOUNT_ID', profile_image_url_https: 'image_normal.png', name:                    'NAME' } };
		});

		it('should callback a twitter tweet', function(done) {
			statuses_show_endpoint.reply(200, default_statuses_show);

			twitter.content({ id: 'CONTENT_ID' }, function(err, content) {
				expect(err).not.to.be.ok;
				expect(content).to.eql({ api:     'twitter', type:    'content', id:      'CONTENT_ID', text:    'TEXT', date:    1338926830000, stats:   { likes:   1001, reposts: 1002 }, account: { api:   'twitter', type:  'account', id:    'ACCOUNT_ID', name:  'NAME', image: { small: 'image_bigger.png', large: 'image.png' } } });
				done();
			});
		});

		it('should replace newlines with linebreaks in the text', function(done) {
			default_statuses_show.text = 'TE\nXT 1';
			statuses_show_endpoint.reply(200, default_statuses_show);

			twitter.content({ id: 'CONTENT_ID' }, function(err, content) {
				expect(err).not.to.be.ok;
				expect(content).to.have.property('text', 'TE<br>XT 1');
				done();
			});
		});

		it('should replace hashtags with links in the text', function(done) {
			default_statuses_show.text = '#thing #thing2';
			statuses_show_endpoint.reply(200, default_statuses_show);

			twitter.content({ id: 'CONTENT_ID' }, function(err, content) {
				expect(err).not.to.be.ok;
				expect(content).to.have.property('text', '<a href="https://twitter.com/hashtag/thing" target="_blank">#thing</a> <a href="https://twitter.com/hashtag/thing2" target="_blank">#thing2</a>');
				done();
			});
		});

		it('should replace accounts with links in the text', function(done) {
			default_statuses_show.text = '@ACCOUNT_ID_1 @ACCOUNT_ID_2';
			statuses_show_endpoint.reply(200, default_statuses_show);

			twitter.content({ id: 'CONTENT_ID' }, function(err, content) {
				expect(err).not.to.be.ok;
				expect(content).to.have.property('text', '<a href="https://twitter.com/ACCOUNT_ID_1" target="_blank">@ACCOUNT_ID_1</a> <a href="https://twitter.com/ACCOUNT_ID_2" target="_blank">@ACCOUNT_ID_2</a>');
				done();
			});
		});

		it('should replace urls with links in the text from entity', function(done) {
			default_statuses_show.text = 'https://t.co/MjJ8xAnT https://t.co/TnAx8JjM';
			default_statuses_show.entities = { urls: [{ expanded_url: 'https://www.hovercards.com', display_url: 'hovercards.com', url: 'https://t.co/MjJ8xAnT' }, { expanded_url: 'https://www.wenoknow.com', display_url: 'wenoknow.com', url: 'https://t.co/TnAx8JjM' }] };
			statuses_show_endpoint.reply(200, default_statuses_show);

			twitter.content({ id: 'CONTENT_ID' }, function(err, content) {
				expect(err).not.to.be.ok;
				expect(content).to.have.property('text', '<a href="https://www.hovercards.com" target="_blank">hovercards.com</a> <a href="https://www.wenoknow.com" target="_blank">wenoknow.com</a>');
				done();
			});
		});

		it('should reference image', function(done) {
			default_statuses_show.text = 'TEXT https://t.co/MjJ8xAnT';
			default_statuses_show.entities = { media: [{ media_url_https: 'image.jpg', url:             'https://t.co/MjJ8xAnT', type:            'photo' }] };
			default_statuses_show.extended_entities = { media: [{ media_url_https: 'image.jpg', url:             'https://t.co/MjJ8xAnT', type:            'photo' }] };
			statuses_show_endpoint.reply(200, default_statuses_show);

			twitter.content({ id: 'CONTENT_ID' }, function(err, content) {
				expect(err).not.to.be.ok;
				expect(content).to.have.property('text', 'TEXT ');
				expect(content).to.have.property('image').that.eql({ small:  'image.jpg:small', medium: 'image.jpg:medium', large:  'image.jpg:large' });
				done();
			});
		});

		it('should reference images', function(done) {
			default_statuses_show.text = 'TEXT https://t.co/MjJ8xAnT';
			default_statuses_show.entities = { media: [{ media_url_https: 'image_1.jpg', url:             'https://t.co/MjJ8xAnT', type:            'photo' }] };
			default_statuses_show.extended_entities = { media: [{ media_url_https: 'image_1.jpg', url:             'https://t.co/MjJ8xAnT', type:            'photo' }, { media_url_https: 'image_2.jpg', url:             'https://t.co/MjJ8xAnT', type:            'photo' }] };
			statuses_show_endpoint.reply(200, default_statuses_show);

			twitter.content({ id: 'CONTENT_ID' }, function(err, content) {
				expect(err).not.to.be.ok;
				expect(content).to.have.property('text', 'TEXT ');
				expect(content).not.to.have.property('image');
				expect(content).to.have.property('images').that.eql([{ small:  'image_1.jpg:small', medium: 'image_1.jpg:medium', large:  'image_1.jpg:large' }, { small:  'image_2.jpg:small', medium: 'image_2.jpg:medium', large:  'image_2.jpg:large' }]);
				done();
			});
		});

		it('should reference gif', function(done) {
			default_statuses_show.text = 'TEXT https://t.co/MjJ8xAnT';
			default_statuses_show.entities = { media: [{ media_url_https: 'image.jpg', url:             'https://t.co/MjJ8xAnT', type:            'photo' }] };
			default_statuses_show.extended_entities = { media: [{ media_url_https: 'image.jpg', url:             'https://t.co/MjJ8xAnT', type:            'animated_gif', video_info:      { variants: [{ content_type: 'video/mp4', url:          'gif.mp4', }] } }] };
			statuses_show_endpoint.reply(200, default_statuses_show);

			twitter.content({ id: 'CONTENT_ID' }, function(err, content) {
				expect(err).not.to.be.ok;
				expect(content).to.have.property('text', 'TEXT ');
				expect(content).to.have.property('image').that.eql({ small:  'image.jpg:small', medium: 'image.jpg:medium', large:  'image.jpg:large' });
				expect(content).to.have.property('gif').that.eql('gif.mp4');
				done();
			});
		});

		it('should reference video', function(done) {
			default_statuses_show.text = 'TEXT https://t.co/MjJ8xAnT';
			default_statuses_show.entities = { media: [{ media_url_https: 'image.jpg', url:             'https://t.co/MjJ8xAnT', type:            'photo' }] };
			default_statuses_show.extended_entities = { media: [{ media_url_https: 'image.jpg', url:             'https://t.co/MjJ8xAnT', type:            'video', video_info:      { variants: [{ content_type: 'video/mp4', url:          'video.mp4', }] } }] };
			statuses_show_endpoint.reply(200, default_statuses_show);

			twitter.content({ id: 'CONTENT_ID' }, function(err, content) {
				expect(err).not.to.be.ok;
				expect(content).to.have.property('text', 'TEXT ');
				expect(content).to.have.property('image').that.eql({ small:  'image.jpg:small', medium: 'image.jpg:medium', large:  'image.jpg:large' });
				expect(content).to.have.property('video').that.eql('video.mp4');
				done();
			});
		});

		// https://dev.twitter.com/overview/api/entities-in-twitter-objects#retweets
		describe('on retweets', function() {
			beforeEach(function() {
				default_statuses_show = { created_at:       'Wed Jun 05 20:07:10 +0000 2012', id_str:           'CONTENT_ID', text:             'RT TEXT', retweet_count:    1002, favorite_count:   1001, user:             { screen_name:             'ACCOUNT_ID', profile_image_url_https: 'image_normal.png', name:                    'NAME' }, retweeted_status: { created_at:     'Wed Jun 05 20:07:10 +0000 2012', id_str:         'CONTENT_ID_1', text:           'TEXT', retweet_count:  1002, favorite_count: 1001, user:           { screen_name:             'ACCOUNT_ID_1', profile_image_url_https: 'image_1_normal.png', name:                    'NAME 1' } } };
			});

			it('should callback with retweeted tweet', function(done) {
				statuses_show_endpoint.reply(200, default_statuses_show);

				twitter.content({ id: 'CONTENT_ID' }, function(err, content) {
					expect(err).not.to.be.ok;
					expect(content).to.eql({ api:              'twitter', type:             'content', id:               'CONTENT_ID', date:             1338926830000, account:          { api:   'twitter', type:  'account', id:    'ACCOUNT_ID', name:  'NAME', image: { small: 'image_bigger.png', large: 'image.png' } }, reposted_content: { api:     'twitter', type:    'content', id:      'CONTENT_ID_1', text:    'TEXT', date:    1338926830000, stats:   { likes:   1001, reposts: 1002 }, account: { api:   'twitter', type:  'account', id:    'ACCOUNT_ID_1', name:  'NAME 1', image: { small: 'image_1_bigger.png', large: 'image_1.png' } } } });
					done();
				});
			});
		});

		describe('on quotes', function() {
			beforeEach(function() {
				default_statuses_show = { created_at:     'Wed Jun 05 20:07:10 +0000 2012', id_str:         'CONTENT_ID', text:           'TEXT https://t.co/4VL91iY8Dn', retweet_count:  1002, favorite_count: 1001, user:           { screen_name:             'ACCOUNT_ID', profile_image_url_https: 'image_normal.png', name:                    'NAME' }, quoted_status:  { created_at:     'Wed Jun 05 20:07:10 +0000 2012', id_str:         'CONTENT_ID_1', text:           'TEXT 1', retweet_count:  1012, favorite_count: 1011, user:           { screen_name:             'ACCOUNT_ID_1', profile_image_url_https: 'image_1_normal.png', name:                    'NAME 1' } }, entities:       { urls: [{ expanded_url: 'https://twitter.com/ACCOUNT_ID_1/status/CONTENT_ID_1', display_url:  'twitter.com/ACCOUNT_ID_1/status/CONTENT_ID_1', url:          'https://t.co/4VL91iY8Dn' }] } };
			});

			it('should callback with quoted tweet', function(done) {
				statuses_show_endpoint.reply(200, default_statuses_show);

				twitter.content({ id: 'CONTENT_ID' }, function(err, content) {
					expect(err).not.to.be.ok;
					expect(content).to.eql({ api:            'twitter', type:           'content', id:             'CONTENT_ID', text:           'TEXT ', date:           1338926830000, stats:          { likes:   1001, reposts: 1002 }, account:        { api:   'twitter', type:  'account', id:    'ACCOUNT_ID', name:  'NAME', image: { small: 'image_bigger.png', large: 'image.png' } }, quoted_content: { api:     'twitter', type:    'content', id:      'CONTENT_ID_1', text:    'TEXT 1', date:    1338926830000, stats:   { likes:   1011, reposts: 1012 }, account: { api:   'twitter', type:  'account', id:    'ACCOUNT_ID_1', name:  'NAME 1', image: { small: 'image_1_bigger.png', large: 'image_1.png' } } } });
					done();
				});
			});
		});

		describe('on replies', function() {
			var statuses_show_reply_endpoint;
			var default_statuses_show_reply;

			beforeEach(function() {
				statuses_show_reply_endpoint = nock('https://api.twitter.com', { reqheaders: { Authorization: /^OAuth.*oauth_consumer_key="TWITTER_CONSUMER_KEY".*oauth_token="APP_TOKEN".*$/ } })
					.get('/1.1/statuses/show/CONTENT_ID_1.json');

				default_statuses_show = { created_at:                 'Wed Jun 05 20:07:10 +0000 2012', id_str:                     'CONTENT_ID', text:                       'TEXT', retweet_count:              1002, favorite_count:             1001, user:                       { screen_name:             'ACCOUNT_ID', profile_image_url_https: 'image_normal.png', name:                    'NAME' }, in_reply_to_status_id_str: 'CONTENT_ID_1', in_reply_to_screen_name:   'ACCOUNT_ID_1' };
				default_statuses_show_reply = { created_at:     'Wed Jun 05 20:07:10 +0000 2012', id_str:         'CONTENT_ID_1', text:           'TEXT 1', retweet_count:  1012, favorite_count: 1011, user:           { screen_name:             'ACCOUNT_ID_1', profile_image_url_https: 'image_1_normal.png', name:                    'NAME 1' } };
			});

			it('should callback with replied to tweets', function(done) {
				statuses_show_endpoint.reply(200, default_statuses_show);
				statuses_show_reply_endpoint.reply(200, default_statuses_show_reply);

				twitter.content({ id: 'CONTENT_ID' }, function(err, content) {
					expect(err).not.to.be.ok;
					expect(content).to.eql({ api:                'twitter', type:               'content', id:                 'CONTENT_ID', text:               'TEXT', date:               1338926830000, stats:              { likes:   1001, reposts: 1002 }, account:            { api:   'twitter', type:  'account', id:    'ACCOUNT_ID', name:  'NAME', image: { small: 'image_bigger.png', large: 'image.png' } }, replied_to_content: { api:     'twitter', type:    'content', id:      'CONTENT_ID_1', text:    'TEXT 1', date:    1338926830000, stats:   { likes:   1011, reposts: 1012 }, account: { api:   'twitter', type:  'account', id:    'ACCOUNT_ID_1', name:  'NAME 1', image: { small: 'image_1_bigger.png', large: 'image_1.png' } } } });
					done();
				});
			});

			describe('usage', function() {
				it('should report', function(done) {
					statuses_show_endpoint.reply(200, default_statuses_show);
					statuses_show_reply_endpoint.reply(200, default_statuses_show_reply);

					twitter.content({ id: 'CONTENT_ID' }, function(err, content, usage) {
						expect(usage).to.have.property('twitter-statuses-show-calls', 2);
						done();
					});
				});
			});

			describe('statuses show timeline endpoint', function() {
				it('should not err on xxx', function(done) {
					statuses_show_endpoint.reply(200, default_statuses_show);
					statuses_show_reply_endpoint.reply(404, { statusCode: 404, errors: [] });

					twitter.content({ id: 'CONTENT_ID' }, function(err, content) {
						expect(err).not.to.be.ok;
						expect(content).not.to.have.property('replied_to_content');
						done();
					});
				});
			});
		});

		describe('usage', function() {
			it('should report', function(done) {
				statuses_show_endpoint.reply(200, default_statuses_show);

				twitter.content({ id: 'CONTENT_ID' }, function(err, content, usage) {
					expect(usage).to.have.property('twitter-statuses-show-calls', 1);
					done();
				});
			});
		});

		describe('statuses user timeline endpoint', function() {
			it('should 401 on Unknown Token', function(done) {
				nock('https://api.twitter.com', { reqheaders: { Authorization: /^OAuth.*oauth_consumer_key="TWITTER_CONSUMER_KEY".*oauth_token="TWITTER_USER".*$/ } })
					.get('/1.1/statuses/show/CONTENT_ID.json')
					.reply(200, default_statuses_show);

				delete secrets.TWITTER_USER;

				twitter.content({ id: 'CONTENT_ID', user: 'TWITTER_USER' }, function(err, content, usage) {
					expect(err).to.eql({ message: 'Twitter Statuses Show', status: 401 });
					expect(usage).to.have.property('twitter-statuses-show-calls', 0);
					done();
				});
			});

			it('should 401 on Invalid/Expired Token', function(done) {
				nock('https://api.twitter.com', { reqheaders: { Authorization: /^OAuth.*oauth_consumer_key="TWITTER_CONSUMER_KEY".*oauth_token="TWITTER_USER".*$/ } })
					.get('/1.1/statuses/show/CONTENT_ID.json')
					.reply(401, { statusCode: 401, errors: [{ code: 89, message: 'Invalid or expired token.' }] });

				twitter.content({ id: 'CONTENT_ID', user: 'TWITTER_USER' }, function(err) {
					expect(err).to.eql({ message: 'Twitter Statuses Show - Invalid or expired token.', status: 401 });
					expect(secrets).not.to.have.property('TWITTER_USER');
					done();
				});
			});

			it('should 401 on 401 with no code', function(done) {
				statuses_show_endpoint.reply(401, { statusCode: 401, request: '/1.1/users/show.json', error: 'Not authorized.' });

				twitter.content({ id: 'CONTENT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Twitter Statuses Show - Not authorized.', status: 401 });
					expect(secrets).to.have.property('TWITTER_USER');
					done();
				});
			});

			it('should 403 on 401 with user and no code', function(done) {
				nock('https://api.twitter.com', { reqheaders: { Authorization: /^OAuth.*oauth_consumer_key="TWITTER_CONSUMER_KEY".*oauth_token="TWITTER_USER".*$/ } })
					.get('/1.1/statuses/show/CONTENT_ID.json')
					.reply(401, { statusCode: 401, request: '/1.1/users/show.json', error: 'Not authorized.' });

				twitter.content({ id: 'CONTENT_ID', user: 'TWITTER_USER' }, function(err) {
					expect(err).to.eql({ message: 'Twitter Statuses Show - Not authorized.', status: 403 });
					expect(secrets).to.have.property('TWITTER_USER');
					done();
				});
			});

			it('should 403 on Protected Account', function(done) {
				statuses_show_endpoint.reply(403, { statusCode: 403, errors: [{ code: 179, message: 'Sorry, you are not authorized to see this status.' }] });

				twitter.content({ id: 'CONTENT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Twitter Statuses Show - Sorry, you are not authorized to see this status.', status: 403 });
					done();
				});
			});

			it('should 404 on 404', function(done) {
				statuses_show_endpoint.reply(404, { statusCode: 404, errors: [] });

				twitter.content({ id: 'CONTENT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Twitter Statuses Show - Twitter API Error', status: 404 });
					done();
				});
			});

			it('should 429 on 429', function(done) {
				statuses_show_endpoint.reply(429, { statusCode: 429, errors: [] });

				twitter.content({ id: 'CONTENT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Twitter Statuses Show - Twitter API Error', status: 429 });
					done();
				});
			});

			it('should 500 on 4xx', function(done) {
				statuses_show_endpoint.reply(478, { statusCode: 478, errors: [] });

				twitter.content({ id: 'CONTENT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Twitter Statuses Show - Twitter API Error', status: 500, original_status: 478 });
					done();
				});
			});

			it('should 502 on 5xx', function(done) {
				statuses_show_endpoint.reply(578, { statusCode: 578, errors: [] });

				twitter.content({ id: 'CONTENT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Twitter Statuses Show - Twitter API Error', status: 502, original_status: 578 });
					done();
				});
			});
		});
	});

	describe('.discussion', function() {
		var search_tweets_endpoint;
		var default_search_tweets;

		// Probably shouldn't do this
		function test_tweet(num, in_reply_to_num) {
			return { created_at:                'Wed Jun 05 20:07:10 +0000 2012', id_str:                    'CONTENT_ID_' + num, text:                      'TEXT ' + num, retweet_count:             num * 1000 + 2, favorite_count:            num * 1000 + 1, user:                      { screen_name:             'ACCOUNT_ID_' + num, profile_image_url_https: 'image_' + num + '_normal.png', name:                    'NAME ' + num }, in_reply_to_status_id_str: !_.isUndefined(in_reply_to_num) && ('CONTENT_ID_' + in_reply_to_num), in_reply_to_screen_name:   !_.isUndefined(in_reply_to_num) && ('ACCOUNT_ID_' + in_reply_to_num) };
		}

		// Probably shouldn't do this
		function test_content(num) {
			return { api:     'twitter', type:    'content', id:      'CONTENT_ID_' + num, text:    'TEXT ' + num, date:    1338926830000, stats:   { likes:   num * 1000 + 1, reposts: num * 1000 + 2 }, account: { api:   'twitter', type:  'account', id:    'ACCOUNT_ID_' + num, name:  'NAME ' + num, image: { small: 'image_' + num + '_bigger.png', large: 'image_' + num + '.png' } } };
		}

		beforeEach(function() {
			search_tweets_endpoint = nock('https://api.twitter.com', { reqheaders: { Authorization: /^OAuth.*oauth_consumer_key="TWITTER_CONSUMER_KEY".*oauth_token="APP_TOKEN".*$/ } })
				.get('/1.1/search/tweets.json')
				.query({ q: 'to:ACCOUNT_ID_0', since_id: 'CONTENT_ID_0', count: 50 });

			default_search_tweets = { statuses: [test_tweet(10, 0), test_tweet(9, 0), test_tweet(8, 0), test_tweet(7, 0), test_tweet(6, 0), test_tweet(5, 0), test_tweet(4, 0), test_tweet(3, 0), test_tweet(2, 0), test_tweet(1, 0)] };
		});

		it('should callback twitter tweets', function(done) {
			search_tweets_endpoint.reply(200, default_search_tweets);

			twitter.discussion({ id: 'CONTENT_ID_0', account: { api: 'twitter', type: 'account', id: 'ACCOUNT_ID_0' } }, function(err, discussion) {
				expect(err).not.to.be.ok;
				expect(discussion).to.eql({ api:      'twitter', type:     'discussion', id:       'CONTENT_ID_0', comments: [test_content(10), test_content(9), test_content(8), test_content(7), test_content(6), test_content(5), test_content(4), test_content(3), test_content(2), test_content(1)] });
				done();
			});
		});

		it('should ignore tweets that are not replies', function(done) {
			default_search_tweets.statuses.unshift(test_tweet(11, 0));
			default_search_tweets.statuses[5] = test_tweet(6, 12);
			search_tweets_endpoint.reply(200, default_search_tweets);

			twitter.discussion({ id: 'CONTENT_ID_0', account: { api: 'twitter', type: 'account', id: 'ACCOUNT_ID_0' } }, function(err, discussion) {
				expect(err).not.to.be.ok;
				expect(discussion).to.eql({ api:      'twitter', type:     'discussion', id:       'CONTENT_ID_0', comments: [test_content(11), test_content(10), test_content(9), test_content(8), test_content(7), test_content(5), test_content(4), test_content(3), test_content(2), test_content(1)] });
				done();
			});
		});

		describe('for content', function() {
			var search_tweets_for_content_endpoint;
			var default_search_tweets_for_content;

			beforeEach(function() {
				search_tweets_for_content_endpoint = nock('https://api.twitter.com', { reqheaders: { Authorization: /^OAuth.*oauth_consumer_key="TWITTER_CONSUMER_KEY".*oauth_token="APP_TOKEN".*$/ } })
					.get('/1.1/search/tweets.json')
					.query({ q: 'www.wenoknow.com OR www.hovercards.com', count: 50 });

				sandbox.stub(urls, 'represent');
				urls.represent.withArgs({ api: 'someapi', type: 'content', id: 'SOME_CONTENT_ID' }).returns(['https://www.wenoknow.com', 'https://www.hovercards.com']);

				default_search_tweets_for_content = { statuses: [test_tweet(10), test_tweet(9), test_tweet(8), test_tweet(7), test_tweet(6), test_tweet(5), test_tweet(4), test_tweet(3), test_tweet(2), test_tweet(1)] };
			});

			it('should callback twitter tweets', function(done) {
				search_tweets_for_content_endpoint.reply(200, default_search_tweets_for_content);

				twitter.discussion({ for: { api: 'someapi', type: 'content', id: 'SOME_CONTENT_ID' } }, function(err, discussion) {
					expect(err).not.to.be.ok;
					expect(discussion).to.eql({ api:      'twitter', type:     'discussion', for:      { api: 'someapi', type: 'content', id: 'SOME_CONTENT_ID' }, comments: [test_content(10), test_content(9), test_content(8), test_content(7), test_content(6), test_content(5), test_content(4), test_content(3), test_content(2), test_content(1)] });
					done();
				});
			});

			it('should callback the original tweet of retweets', function(done) {
				default_search_tweets_for_content.statuses[9].retweeted_status = test_tweet(11);
				default_search_tweets_for_content.statuses[9].text = 'RT ' + default_search_tweets_for_content.statuses[9].retweeted_status.text;
				default_search_tweets_for_content.statuses[9].retweet_count = default_search_tweets_for_content.statuses[9].retweeted_status.retweet_count;
				default_search_tweets_for_content.statuses[9].favorite_count = default_search_tweets_for_content.statuses[9].retweeted_status.favorite_count;
				search_tweets_for_content_endpoint.reply(200, default_search_tweets_for_content);

				twitter.discussion({ for: { api: 'someapi', type: 'content', id: 'SOME_CONTENT_ID' } }, function(err, discussion) {
					expect(err).not.to.be.ok;
					expect(discussion).to.eql({ api:      'twitter', type:     'discussion', for:      { api: 'someapi', type: 'content', id: 'SOME_CONTENT_ID' }, comments: [test_content(10), test_content(9), test_content(8), test_content(7), test_content(6), test_content(5), test_content(4), test_content(3), test_content(2), test_content(11)] });
					done();
				});
			});

			it('should ignore retweets of included tweets', function(done) {
				default_search_tweets_for_content.statuses[9].retweeted_status = test_tweet(10);
				default_search_tweets_for_content.statuses[9].text = 'RT ' + default_search_tweets_for_content.statuses[9].retweeted_status.text;
				default_search_tweets_for_content.statuses[9].retweet_count = default_search_tweets_for_content.statuses[9].retweeted_status.retweet_count;
				default_search_tweets_for_content.statuses[9].favorite_count = default_search_tweets_for_content.statuses[9].retweeted_status.favorite_count;
				search_tweets_for_content_endpoint.reply(200, default_search_tweets_for_content);

				twitter.discussion({ for: { api: 'someapi', type: 'content', id: 'SOME_CONTENT_ID' } }, function(err, discussion) {
					expect(err).not.to.be.ok;
					expect(discussion).to.eql({ api:      'twitter', type:     'discussion', for:      { api: 'someapi', type: 'content', id: 'SOME_CONTENT_ID' }, comments: [test_content(10), test_content(9), test_content(8), test_content(7), test_content(6), test_content(5), test_content(4), test_content(3), test_content(2)] });
					done();
				});
			});
		});

		it('should replace newlines with linebreaks in the text', function(done) {
			default_search_tweets.statuses[0].text = 'TEXT\n10';
			default_search_tweets.statuses[1].text = 'TEXT\n9';
			default_search_tweets.statuses[2].text = 'TEXT\n8';
			default_search_tweets.statuses[3].text = 'TEXT\n7';
			default_search_tweets.statuses[4].text = 'TEXT\n6';
			default_search_tweets.statuses[5].text = 'TEXT\n5';
			default_search_tweets.statuses[6].text = 'TEXT\n4';
			default_search_tweets.statuses[7].text = 'TEXT\n3';
			default_search_tweets.statuses[8].text = 'TEXT\n2';
			default_search_tweets.statuses[9].text = 'TEXT\n1';
			search_tweets_endpoint.reply(200, default_search_tweets);

			twitter.discussion({ id: 'CONTENT_ID_0', account: { api: 'twitter', type: 'account', id: 'ACCOUNT_ID_0' } }, function(err, discussion) {
				expect(err).not.to.be.ok;
				expect(discussion).to.have.deep.property('comments[0].text', 'TEXT<br>10');
				expect(discussion).to.have.deep.property('comments[1].text', 'TEXT<br>9');
				expect(discussion).to.have.deep.property('comments[2].text', 'TEXT<br>8');
				expect(discussion).to.have.deep.property('comments[3].text', 'TEXT<br>7');
				expect(discussion).to.have.deep.property('comments[4].text', 'TEXT<br>6');
				expect(discussion).to.have.deep.property('comments[5].text', 'TEXT<br>5');
				expect(discussion).to.have.deep.property('comments[6].text', 'TEXT<br>4');
				expect(discussion).to.have.deep.property('comments[7].text', 'TEXT<br>3');
				expect(discussion).to.have.deep.property('comments[8].text', 'TEXT<br>2');
				expect(discussion).to.have.deep.property('comments[9].text', 'TEXT<br>1');
				done();
			});
		});

		it('should replace hashtags with links in the text', function(done) {
			default_search_tweets.statuses[0].text = '#thing';
			default_search_tweets.statuses[1].text = '#thing1';
			default_search_tweets.statuses[2].text = '#thing2';
			default_search_tweets.statuses[3].text = '#thing3';
			default_search_tweets.statuses[4].text = '#thing4';
			default_search_tweets.statuses[5].text = '#thing5';
			default_search_tweets.statuses[6].text = '#thing6';
			default_search_tweets.statuses[7].text = '#thing7';
			default_search_tweets.statuses[8].text = '#thing8';
			default_search_tweets.statuses[9].text = '#thing9';
			search_tweets_endpoint.reply(200, default_search_tweets);

			twitter.discussion({ id: 'CONTENT_ID_0', account: { api: 'twitter', type: 'account', id: 'ACCOUNT_ID_0' } }, function(err, discussion) {
				expect(err).not.to.be.ok;
				expect(discussion).to.have.deep.property('comments[0].text', '<a href="https://twitter.com/hashtag/thing" target="_blank">#thing</a>');
				expect(discussion).to.have.deep.property('comments[1].text', '<a href="https://twitter.com/hashtag/thing1" target="_blank">#thing1</a>');
				expect(discussion).to.have.deep.property('comments[2].text', '<a href="https://twitter.com/hashtag/thing2" target="_blank">#thing2</a>');
				expect(discussion).to.have.deep.property('comments[3].text', '<a href="https://twitter.com/hashtag/thing3" target="_blank">#thing3</a>');
				expect(discussion).to.have.deep.property('comments[4].text', '<a href="https://twitter.com/hashtag/thing4" target="_blank">#thing4</a>');
				expect(discussion).to.have.deep.property('comments[5].text', '<a href="https://twitter.com/hashtag/thing5" target="_blank">#thing5</a>');
				expect(discussion).to.have.deep.property('comments[6].text', '<a href="https://twitter.com/hashtag/thing6" target="_blank">#thing6</a>');
				expect(discussion).to.have.deep.property('comments[7].text', '<a href="https://twitter.com/hashtag/thing7" target="_blank">#thing7</a>');
				expect(discussion).to.have.deep.property('comments[8].text', '<a href="https://twitter.com/hashtag/thing8" target="_blank">#thing8</a>');
				expect(discussion).to.have.deep.property('comments[9].text', '<a href="https://twitter.com/hashtag/thing9" target="_blank">#thing9</a>');
				done();
			});
		});

		it('should replace accounts with links in the text', function(done) {
			default_search_tweets.statuses[0].text = '@ACCOUNT_ID_0';
			default_search_tweets.statuses[1].text = '@ACCOUNT_ID_1';
			default_search_tweets.statuses[2].text = '@ACCOUNT_ID_2';
			default_search_tweets.statuses[3].text = '@ACCOUNT_ID_3';
			default_search_tweets.statuses[4].text = '@ACCOUNT_ID_4';
			default_search_tweets.statuses[5].text = '@ACCOUNT_ID_5';
			default_search_tweets.statuses[6].text = '@ACCOUNT_ID_6';
			default_search_tweets.statuses[7].text = '@ACCOUNT_ID_7';
			default_search_tweets.statuses[8].text = '@ACCOUNT_ID_8';
			default_search_tweets.statuses[9].text = '@ACCOUNT_ID_9';
			search_tweets_endpoint.reply(200, default_search_tweets);

			twitter.discussion({ id: 'CONTENT_ID_0', account: { api: 'twitter', type: 'account', id: 'ACCOUNT_ID_0' } }, function(err, discussion) {
				expect(err).not.to.be.ok;
				expect(discussion).to.have.deep.property('comments[0].text', '<a href="https://twitter.com/ACCOUNT_ID_0" target="_blank">@ACCOUNT_ID_0</a>');
				expect(discussion).to.have.deep.property('comments[1].text', '<a href="https://twitter.com/ACCOUNT_ID_1" target="_blank">@ACCOUNT_ID_1</a>');
				expect(discussion).to.have.deep.property('comments[2].text', '<a href="https://twitter.com/ACCOUNT_ID_2" target="_blank">@ACCOUNT_ID_2</a>');
				expect(discussion).to.have.deep.property('comments[3].text', '<a href="https://twitter.com/ACCOUNT_ID_3" target="_blank">@ACCOUNT_ID_3</a>');
				expect(discussion).to.have.deep.property('comments[4].text', '<a href="https://twitter.com/ACCOUNT_ID_4" target="_blank">@ACCOUNT_ID_4</a>');
				expect(discussion).to.have.deep.property('comments[5].text', '<a href="https://twitter.com/ACCOUNT_ID_5" target="_blank">@ACCOUNT_ID_5</a>');
				expect(discussion).to.have.deep.property('comments[6].text', '<a href="https://twitter.com/ACCOUNT_ID_6" target="_blank">@ACCOUNT_ID_6</a>');
				expect(discussion).to.have.deep.property('comments[7].text', '<a href="https://twitter.com/ACCOUNT_ID_7" target="_blank">@ACCOUNT_ID_7</a>');
				expect(discussion).to.have.deep.property('comments[8].text', '<a href="https://twitter.com/ACCOUNT_ID_8" target="_blank">@ACCOUNT_ID_8</a>');
				expect(discussion).to.have.deep.property('comments[9].text', '<a href="https://twitter.com/ACCOUNT_ID_9" target="_blank">@ACCOUNT_ID_9</a>');
				done();
			});
		});

		it('should replace urls with links in the text from entity', function(done) {
			default_search_tweets.statuses[0].text = 'https://t.co/MjJ8xAn0';
			default_search_tweets.statuses[1].text = 'https://t.co/MjJ8xAn1';
			default_search_tweets.statuses[2].text = 'https://t.co/MjJ8xAn2';
			default_search_tweets.statuses[3].text = 'https://t.co/MjJ8xAn3';
			default_search_tweets.statuses[4].text = 'https://t.co/MjJ8xAn4';
			default_search_tweets.statuses[5].text = 'https://t.co/MjJ8xAn5';
			default_search_tweets.statuses[6].text = 'https://t.co/MjJ8xAn6';
			default_search_tweets.statuses[7].text = 'https://t.co/MjJ8xAn7';
			default_search_tweets.statuses[8].text = 'https://t.co/MjJ8xAn8';
			default_search_tweets.statuses[9].text = 'https://t.co/MjJ8xAn9';
			default_search_tweets.statuses[0].entities = { urls: [{ expanded_url: 'https://www.hovercards_0.com', display_url: 'hovercards_0.com', url: 'https://t.co/MjJ8xAn0' }] };
			default_search_tweets.statuses[1].entities = { urls: [{ expanded_url: 'https://www.hovercards_1.com', display_url: 'hovercards_1.com', url: 'https://t.co/MjJ8xAn1' }] };
			default_search_tweets.statuses[2].entities = { urls: [{ expanded_url: 'https://www.hovercards_2.com', display_url: 'hovercards_2.com', url: 'https://t.co/MjJ8xAn2' }] };
			default_search_tweets.statuses[3].entities = { urls: [{ expanded_url: 'https://www.hovercards_3.com', display_url: 'hovercards_3.com', url: 'https://t.co/MjJ8xAn3' }] };
			default_search_tweets.statuses[4].entities = { urls: [{ expanded_url: 'https://www.hovercards_4.com', display_url: 'hovercards_4.com', url: 'https://t.co/MjJ8xAn4' }] };
			default_search_tweets.statuses[5].entities = { urls: [{ expanded_url: 'https://www.hovercards_5.com', display_url: 'hovercards_5.com', url: 'https://t.co/MjJ8xAn5' }] };
			default_search_tweets.statuses[6].entities = { urls: [{ expanded_url: 'https://www.hovercards_6.com', display_url: 'hovercards_6.com', url: 'https://t.co/MjJ8xAn6' }] };
			default_search_tweets.statuses[7].entities = { urls: [{ expanded_url: 'https://www.hovercards_7.com', display_url: 'hovercards_7.com', url: 'https://t.co/MjJ8xAn7' }] };
			default_search_tweets.statuses[8].entities = { urls: [{ expanded_url: 'https://www.hovercards_8.com', display_url: 'hovercards_8.com', url: 'https://t.co/MjJ8xAn8' }] };
			default_search_tweets.statuses[9].entities = { urls: [{ expanded_url: 'https://www.hovercards_9.com', display_url: 'hovercards_9.com', url: 'https://t.co/MjJ8xAn9' }] };
			search_tweets_endpoint.reply(200, default_search_tweets);

			twitter.discussion({ id: 'CONTENT_ID_0', account: { api: 'twitter', type: 'account', id: 'ACCOUNT_ID_0' } }, function(err, discussion) {
				expect(err).not.to.be.ok;
				expect(discussion).to.have.deep.property('comments[0].text', '<a href="https://www.hovercards_0.com" target="_blank">hovercards_0.com</a>');
				expect(discussion).to.have.deep.property('comments[1].text', '<a href="https://www.hovercards_1.com" target="_blank">hovercards_1.com</a>');
				expect(discussion).to.have.deep.property('comments[2].text', '<a href="https://www.hovercards_2.com" target="_blank">hovercards_2.com</a>');
				expect(discussion).to.have.deep.property('comments[3].text', '<a href="https://www.hovercards_3.com" target="_blank">hovercards_3.com</a>');
				expect(discussion).to.have.deep.property('comments[4].text', '<a href="https://www.hovercards_4.com" target="_blank">hovercards_4.com</a>');
				expect(discussion).to.have.deep.property('comments[5].text', '<a href="https://www.hovercards_5.com" target="_blank">hovercards_5.com</a>');
				expect(discussion).to.have.deep.property('comments[6].text', '<a href="https://www.hovercards_6.com" target="_blank">hovercards_6.com</a>');
				expect(discussion).to.have.deep.property('comments[7].text', '<a href="https://www.hovercards_7.com" target="_blank">hovercards_7.com</a>');
				expect(discussion).to.have.deep.property('comments[8].text', '<a href="https://www.hovercards_8.com" target="_blank">hovercards_8.com</a>');
				expect(discussion).to.have.deep.property('comments[9].text', '<a href="https://www.hovercards_9.com" target="_blank">hovercards_9.com</a>');
				done();
			});
		});

		it('should reference image', function(done) {
			default_search_tweets.statuses[0].text = 'TEXT 1 https://t.co/MjJ8xAnT';
			default_search_tweets.statuses[1].text = 'TEXT 2 https://t.co/TnAx8JjM';
			default_search_tweets.statuses[0].entities = { media: [{ media_url_https: 'image_1.jpg', url:             'https://t.co/MjJ8xAnT', type:            'photo' }] };
			default_search_tweets.statuses[1].entities = { media: [{ media_url_https: 'image_2.jpg', url:             'https://t.co/TnAx8JjM', type:            'photo' }] };
			default_search_tweets.statuses[0].extended_entities = { media: [{ media_url_https: 'image_1.jpg', url:             'https://t.co/MjJ8xAnT', type:            'photo' }] };
			default_search_tweets.statuses[1].extended_entities = { media: [{ media_url_https: 'image_2.jpg', url:             'https://t.co/TnAx8JjM', type:            'photo' }] };
			search_tweets_endpoint.reply(200, default_search_tweets);

			twitter.discussion({ id: 'CONTENT_ID_0', account: { api: 'twitter', type: 'account', id: 'ACCOUNT_ID_0' } }, function(err, discussion) {
				expect(err).not.to.be.ok;
				expect(discussion).to.have.deep.property('comments[0].text', 'TEXT 1 ');
				expect(discussion).to.have.deep.property('comments[0].image').that.eql({ small:  'image_1.jpg:small', medium: 'image_1.jpg:medium', large:  'image_1.jpg:large' });
				expect(discussion).to.have.deep.property('comments[1].text', 'TEXT 2 ');
				expect(discussion).to.have.deep.property('comments[1].image').that.eql({ small:  'image_2.jpg:small', medium: 'image_2.jpg:medium', large:  'image_2.jpg:large' });
				done();
			});
		});

		it('should reference images', function(done) {
			default_search_tweets.statuses[0].text = 'TEXT 1 https://t.co/MjJ8xAnT';
			default_search_tweets.statuses[1].text = 'TEXT 2 https://t.co/TnAx8JjM';
			default_search_tweets.statuses[0].entities = { media: [{ media_url_https: 'image_1_1.jpg', url:             'https://t.co/MjJ8xAnT', type:            'photo' }] };
			default_search_tweets.statuses[1].entities = { media: [{ media_url_https: 'image_2_1.jpg', url:             'https://t.co/TnAx8JjM', type:            'photo' }] };
			default_search_tweets.statuses[0].extended_entities = { media: [{ media_url_https: 'image_1_1.jpg', url:             'https://t.co/MjJ8xAnT', type:            'photo' }, { media_url_https: 'image_1_2.jpg', url:             'https://t.co/MjJ8xAnT', type:            'photo' }] };
			default_search_tweets.statuses[1].extended_entities = { media: [{ media_url_https: 'image_2_1.jpg', url:             'https://t.co/TnAx8JjM', type:            'photo' }, { media_url_https: 'image_2_2.jpg', url:             'https://t.co/TnAx8JjM', type:            'photo' }] };
			search_tweets_endpoint.reply(200, default_search_tweets);

			twitter.discussion({ id: 'CONTENT_ID_0', account: { api: 'twitter', type: 'account', id: 'ACCOUNT_ID_0' } }, function(err, discussion) {
				expect(err).not.to.be.ok;
				expect(discussion).to.have.deep.property('comments[0].text', 'TEXT 1 ');
				expect(discussion).not.to.have.deep.property('comments[0].image'),
				expect(discussion).to.have.deep.property('comments[0].images').that.eql([{ small:  'image_1_1.jpg:small', medium: 'image_1_1.jpg:medium', large:  'image_1_1.jpg:large' }, { small:  'image_1_2.jpg:small', medium: 'image_1_2.jpg:medium', large:  'image_1_2.jpg:large' }]);
				expect(discussion).to.have.deep.property('comments[1].text', 'TEXT 2 ');
				expect(discussion).not.to.have.deep.property('comments[1].image'),
				expect(discussion).to.have.deep.property('comments[1].images').that.eql([{ small:  'image_2_1.jpg:small', medium: 'image_2_1.jpg:medium', large:  'image_2_1.jpg:large' }, { small:  'image_2_2.jpg:small', medium: 'image_2_2.jpg:medium', large:  'image_2_2.jpg:large' }]);
				done();
			});
		});

		it('should reference gif', function(done) {
			default_search_tweets.statuses[0].text = 'TEXT 1 https://t.co/MjJ8xAnT';
			default_search_tweets.statuses[1].text = 'TEXT 2 https://t.co/TnAx8JjM';
			default_search_tweets.statuses[0].entities = { media: [{ media_url_https: 'image_1.jpg', url:             'https://t.co/MjJ8xAnT', type:            'photo' }] };
			default_search_tweets.statuses[1].entities = { media: [{ media_url_https: 'image_2.jpg', url:             'https://t.co/TnAx8JjM', type:            'photo' }] };
			default_search_tweets.statuses[0].extended_entities = { media: [{ media_url_https: 'image_1.jpg', url:             'https://t.co/MjJ8xAnT', type:            'animated_gif', video_info:      { variants: [{ content_type: 'video/mp4', url:          'gif_1.mp4', }] } }] };
			default_search_tweets.statuses[1].extended_entities = { media: [{ media_url_https: 'image_2.jpg', url:             'https://t.co/TnAx8JjM', type:            'animated_gif', video_info:      { variants: [{ content_type: 'video/mp4', url:          'gif_2.mp4', }] } }] };
			search_tweets_endpoint.reply(200, default_search_tweets);

			twitter.discussion({ id: 'CONTENT_ID_0', account: { api: 'twitter', type: 'account', id: 'ACCOUNT_ID_0' } }, function(err, discussion) {
				expect(err).not.to.be.ok;
				expect(discussion).to.have.deep.property('comments[0].text', 'TEXT 1 ');
				expect(discussion).to.have.deep.property('comments[0].image').that.eql({ small:  'image_1.jpg:small', medium: 'image_1.jpg:medium', large:  'image_1.jpg:large' });
				expect(discussion).to.have.deep.property('comments[0].gif').that.eql('gif_1.mp4');
				expect(discussion).to.have.deep.property('comments[1].text', 'TEXT 2 ');
				expect(discussion).to.have.deep.property('comments[1].image').that.eql({ small:  'image_2.jpg:small', medium: 'image_2.jpg:medium', large:  'image_2.jpg:large' });
				expect(discussion).to.have.deep.property('comments[1].gif').that.eql('gif_2.mp4');
				done();
			});
		});

		it('should reference video', function(done) {
			default_search_tweets.statuses[0].text = 'TEXT 1 https://t.co/MjJ8xAnT';
			default_search_tweets.statuses[1].text = 'TEXT 2 https://t.co/TnAx8JjM';
			default_search_tweets.statuses[0].entities = { media: [{ media_url_https: 'image_1.jpg', url:             'https://t.co/MjJ8xAnT', type:            'photo' }] };
			default_search_tweets.statuses[1].entities = { media: [{ media_url_https: 'image_2.jpg', url:             'https://t.co/TnAx8JjM', type:            'photo' }] };
			default_search_tweets.statuses[0].extended_entities = { media: [{ media_url_https: 'image_1.jpg', url:             'https://t.co/MjJ8xAnT', type:            'video', video_info:      { variants: [{ content_type: 'video/mp4', url:          'video_1.mp4', }] } }] };
			default_search_tweets.statuses[1].extended_entities = { media: [{ media_url_https: 'image_2.jpg', url:             'https://t.co/TnAx8JjM', type:            'video', video_info:      { variants: [{ content_type: 'video/mp4', url:          'video_2.mp4', }] } }] };
			search_tweets_endpoint.reply(200, default_search_tweets);

			twitter.discussion({ id: 'CONTENT_ID_0', account: { api: 'twitter', type: 'account', id: 'ACCOUNT_ID_0' } }, function(err, discussion) {
				expect(err).not.to.be.ok;
				expect(discussion).to.have.deep.property('comments[0].text', 'TEXT 1 ');
				expect(discussion).to.have.deep.property('comments[0].image').that.eql({ small:  'image_1.jpg:small', medium: 'image_1.jpg:medium', large:  'image_1.jpg:large' });
				expect(discussion).to.have.deep.property('comments[0].video').that.eql('video_1.mp4');
				expect(discussion).to.have.deep.property('comments[1].text', 'TEXT 2 ');
				expect(discussion).to.have.deep.property('comments[1].image').that.eql({ small:  'image_2.jpg:small', medium: 'image_2.jpg:medium', large:  'image_2.jpg:large' });
				expect(discussion).to.have.deep.property('comments[1].video').that.eql('video_2.mp4');
				done();
			});
		});

		describe('on retweets', function() {
			it('should callback with retweeted tweets');
		});

		describe('on quotes', function() {
			it('should callback with quoted tweets');
		});

		describe('usage', function() {
			it('should report', function(done) {
				search_tweets_endpoint.reply(200, default_search_tweets);

				twitter.discussion({ id: 'CONTENT_ID_0', account: { api: 'twitter', type: 'account', id: 'ACCOUNT_ID_0' } }, function(err, discussion, usage) {
					expect(usage).to.have.property('twitter-search-tweets-calls', 1);
					done();
				});
			});
		});

		describe('search tweets endpoint', function() {
			it('should 401 on Unknown Token', function(done) {
				nock('https://api.twitter.com', { reqheaders: { Authorization: /^OAuth.*oauth_consumer_key="TWITTER_CONSUMER_KEY".*oauth_token="TWITTER_USER".*$/ } })
					.get('/1.1/search/tweets.json')
					.query({ q: 'to:ACCOUNT_ID_0', since_id: 'CONTENT_ID_0', count: 50 })
					.reply(200, default_search_tweets);

				delete secrets.TWITTER_USER;

				twitter.discussion({ id: 'CONTENT_ID_0', user: 'TWITTER_USER', account: { api: 'twitter', type: 'account', id: 'ACCOUNT_ID_0' } }, function(err, discussion, usage) {
					expect(err).to.eql({ message: 'Twitter Search Tweets', status: 401 });
					expect(usage).to.have.property('twitter-search-tweets-calls', 0);
					done();
				});
			});

			it('should 401 on Invalid/Expired Token', function(done) {
				nock('https://api.twitter.com', { reqheaders: { Authorization: /^OAuth.*oauth_consumer_key="TWITTER_CONSUMER_KEY".*oauth_token="TWITTER_USER".*$/ } })
					.get('/1.1/search/tweets.json')
					.query({ q: 'to:ACCOUNT_ID_0', since_id: 'CONTENT_ID_0', count: 50 })
					.reply(401, { statusCode: 401, errors: [{ code: 89, message: 'Invalid or expired token.' }] });

				twitter.discussion({ id: 'CONTENT_ID_0', user: 'TWITTER_USER', account: { api: 'twitter', type: 'account', id: 'ACCOUNT_ID_0' } }, function(err) {
					expect(err).to.eql({ message: 'Twitter Search Tweets - Invalid or expired token.', status: 401 });
					expect(secrets).not.to.have.property('TWITTER_USER');
					done();
				});
			});

			it('should 401 on 401 with no code', function(done) {
				search_tweets_endpoint.reply(401, { statusCode: 401, request: '/1.1/users/show.json', error: 'Not authorized.' });

				twitter.discussion({ id: 'CONTENT_ID_0', account: { api: 'twitter', type: 'account', id: 'ACCOUNT_ID_0' } }, function(err) {
					expect(err).to.eql({ message: 'Twitter Search Tweets - Not authorized.', status: 401 });
					expect(secrets).to.have.property('TWITTER_USER');
					done();
				});
			});

			it('should 403 on 401 with user and no code', function(done) {
				nock('https://api.twitter.com', { reqheaders: { Authorization: /^OAuth.*oauth_consumer_key="TWITTER_CONSUMER_KEY".*oauth_token="TWITTER_USER".*$/ } })
					.get('/1.1/search/tweets.json')
					.query({ q: 'to:ACCOUNT_ID_0', since_id: 'CONTENT_ID_0', count: 50 })
					.reply(401, { statusCode: 401, request: '/1.1/users/show.json', error: 'Not authorized.' });

				twitter.discussion({ id: 'CONTENT_ID_0', user: 'TWITTER_USER', account: { api: 'twitter', type: 'account', id: 'ACCOUNT_ID_0' } }, function(err) {
					expect(err).to.eql({ message: 'Twitter Search Tweets - Not authorized.', status: 403 });
					expect(secrets).to.have.property('TWITTER_USER');
					done();
				});
			});

			it('should 403 on Protected Account', function(done) {
				search_tweets_endpoint.reply(403, { statusCode: 403, errors: [{ code: 179, message: 'Sorry, you are not authorized to see this status.' }] });

				twitter.discussion({ id: 'CONTENT_ID_0', account: { api: 'twitter', type: 'account', id: 'ACCOUNT_ID_0' } }, function(err) {
					expect(err).to.eql({ message: 'Twitter Search Tweets - Sorry, you are not authorized to see this status.', status: 403 });
					done();
				});
			});

			it('should 404 on 404', function(done) {
				search_tweets_endpoint.reply(404, { statusCode: 404, errors: [] });

				twitter.discussion({ id: 'CONTENT_ID_0', account: { api: 'twitter', type: 'account', id: 'ACCOUNT_ID_0' } }, function(err) {
					expect(err).to.eql({ message: 'Twitter Search Tweets - Twitter API Error', status: 404 });
					done();
				});
			});

			it('should 429 on 429', function(done) {
				search_tweets_endpoint.reply(429, { statusCode: 429, errors: [] });

				twitter.discussion({ id: 'CONTENT_ID_0', account: { api: 'twitter', type: 'account', id: 'ACCOUNT_ID_0' } }, function(err) {
					expect(err).to.eql({ message: 'Twitter Search Tweets - Twitter API Error', status: 429 });
					done();
				});
			});

			it('should 500 on 4xx', function(done) {
				search_tweets_endpoint.reply(478, { statusCode: 478, errors: [] });

				twitter.discussion({ id: 'CONTENT_ID_0', account: { api: 'twitter', type: 'account', id: 'ACCOUNT_ID_0' } }, function(err) {
					expect(err).to.eql({ message: 'Twitter Search Tweets - Twitter API Error', status: 500, original_status: 478 });
					done();
				});
			});

			it('should 502 on 5xx', function(done) {
				search_tweets_endpoint.reply(578, { statusCode: 578, errors: [] });

				twitter.discussion({ id: 'CONTENT_ID_0', account: { api: 'twitter', type: 'account', id: 'ACCOUNT_ID_0' } }, function(err) {
					expect(err).to.eql({ message: 'Twitter Search Tweets - Twitter API Error', status: 502, original_status: 578 });
					done();
				});
			});
		});
	});

	describe('.account', function() {
		var user_show_endpoint;
		var default_user_show;

		beforeEach(function() {
			user_show_endpoint = nock('https://api.twitter.com', { reqheaders: { Authorization: /^OAuth.*oauth_consumer_key="TWITTER_CONSUMER_KEY".*oauth_token="APP_TOKEN".*$/ } })
				.get('/1.1/users/show.json')
				.query({ screen_name: 'ACCOUNT_ID' });

			sandbox.stub(urls, 'parse');

			default_user_show = { screen_name:             'ACCOUNT_ID', profile_image_url_https: 'image_normal.png', profile_banner_url:      'banner', name:                    'NAME', description:             'TEXT', statuses_count:          1000, friends_count:           3000, followers_count:         2000 };
		});

		it('should callback twitter user', function(done) {
			user_show_endpoint.reply(200, default_user_show);

			twitter.account({ id: 'ACCOUNT_ID' }, function(err, account) {
				expect(err).not.to.be.ok;
				expect(account).to.eql({ api:    'twitter', type:   'account', id:     'ACCOUNT_ID', name:   'NAME', text:   'TEXT', image:  { small: 'image_bigger.png', large: 'image.png' }, banner: 'banner/1500x500', stats:  { content:   1000, followers: 2000, following: 3000 } });
				done();
			});
		});

		it('should callback verified', function(done) {
			default_user_show.verified = true;
			user_show_endpoint.reply(200, default_user_show);

			twitter.account({ id: 'ACCOUNT_ID' }, function(err, account) {
				expect(err).not.to.be.ok;
				expect(account).to.have.property('verified').that.is.true;
				done();
			});
		});

		it('should reference accounts in text', function(done) {
			default_user_show.description = 'https://t.co/MjJ8xAnT @ACCOUNT_ID_2';
			default_user_show.entities = { description: { urls: [{ expanded_url: 'https://www.hovercards.com', url:          'https://t.co/MjJ8xAnT' }] } };
			user_show_endpoint.reply(200, default_user_show);

			urls.parse.withArgs('https://www.hovercards.com').returns({ api: 'some_api', type: 'account', id: 'ACCOUNT_ID_1' });
			urls.parse.withArgs('https://twitter.com/ACCOUNT_ID_2').returns({ api: 'twitter', type: 'account', id: 'ACCOUNT_ID_2' });

			twitter.account({ id: 'ACCOUNT_ID' }, function(err, account) {
				expect(err).not.to.be.ok;
				expect(account.accounts).to.contain({ api: 'some_api', type: 'account', id: 'ACCOUNT_ID_1' });
				expect(account.accounts).to.contain({ api: 'twitter', type: 'account', id: 'ACCOUNT_ID_2' });
				done();
			});
		});

		it('should reference account in website', function(done) {
			default_user_show.url = 'https://t.co/78pYTvWfJd';
			default_user_show.entities = { url: { urls: [{ expanded_url: 'https://www.hovercards.com', url:          'https://t.co/78pYTvWfJd' }] } };
			user_show_endpoint.reply(200, default_user_show);

			urls.parse.withArgs('https://www.hovercards.com').returns({ api: 'some_api', type: 'account', id: 'ACCOUNT_ID_1' });

			twitter.account({ id: 'ACCOUNT_ID' }, function(err, account) {
				expect(err).not.to.be.ok;
				expect(account.accounts).to.contain({ api: 'some_api', type: 'account', id: 'ACCOUNT_ID_1' });
				done();
			});
		});

		it('should replace hashtags with links in the text', function(done) {
			default_user_show.description = '#thing #thing2';
			user_show_endpoint.reply(200, default_user_show);

			twitter.account({ id: 'ACCOUNT_ID' }, function(err, account) {
				expect(err).not.to.be.ok;
				expect(account).to.have.property('text', '<a href="https://twitter.com/hashtag/thing" target="_blank">#thing</a> <a href="https://twitter.com/hashtag/thing2" target="_blank">#thing2</a>');
				done();
			});
		});

		it('should replace accounts with links in the text', function(done) {
			default_user_show.description = '@ACCOUNT_ID_1 @ACCOUNT_ID_2';
			user_show_endpoint.reply(200, default_user_show);

			twitter.account({ id: 'ACCOUNT_ID' }, function(err, account) {
				expect(err).not.to.be.ok;
				expect(account).to.have.property('text', '<a href="https://twitter.com/ACCOUNT_ID_1" target="_blank">@ACCOUNT_ID_1</a> <a href="https://twitter.com/ACCOUNT_ID_2" target="_blank">@ACCOUNT_ID_2</a>');
				done();
			});
		});

		it('should remove the default image', function(done) {
			default_user_show.default_profile_image = true;
			default_user_show.profile_image_url_https = 'https://abs.twimg.com/sticky/default_profile_images/default_profile_0.png';
			user_show_endpoint.reply(200, default_user_show);

			twitter.account({ id: 'ACCOUNT_ID' }, function(err, account) {
				expect(account).not.to.have.property('image');
				done();
			});
		});

		it('should replace urls with links in the text from entity', function(done) {
			default_user_show.description = 'https://t.co/MjJ8xAnT https://t.co/TnAx8JjM';
			default_user_show.entities = { description: { urls: [{ expanded_url: 'https://www.hovercards.com', display_url:  'hovercards.com', url:          'https://t.co/MjJ8xAnT' }, { expanded_url: 'https://www.wenoknow.com', display_url:  'wenoknow.com', url:          'https://t.co/TnAx8JjM' }] } };
			user_show_endpoint.reply(200, default_user_show);

			twitter.account({ id: 'ACCOUNT_ID' }, function(err, account) {
				expect(err).not.to.be.ok;
				expect(account).to.have.property('text', '<a href="https://www.hovercards.com" target="_blank">hovercards.com</a> <a href="https://www.wenoknow.com" target="_blank">wenoknow.com</a>');
				done();
			});
		});

		describe('usage', function() {
			it('should report', function(done) {
				user_show_endpoint.reply(200, default_user_show);

				twitter.account({ id: 'ACCOUNT_ID' }, function(err, account, usage) {
					expect(usage).to.have.property('twitter-user-show-calls', 1);
					done();
				});
			});
		});

		describe('user show endpoint', function() {
			it('should 401 on Unknown Token', function(done) {
				nock('https://api.twitter.com', { reqheaders: { Authorization: /^OAuth.*oauth_consumer_key="TWITTER_CONSUMER_KEY".*oauth_token="TWITTER_USER".*$/ } })
					.get('/1.1/users/show.json')
					.query({ screen_name: 'ACCOUNT_ID' })
					.reply(200, default_user_show);

				delete secrets.TWITTER_USER;

				twitter.account({ id: 'ACCOUNT_ID', user: 'TWITTER_USER' }, function(err, account, usage) {
					expect(err).to.eql({ message: 'Twitter User Show', status: 401 });
					expect(usage).to.have.property('twitter-user-show-calls', 0);
					done();
				});
			});

			it('should 401 on Invalid/Expired Token', function(done) {
				nock('https://api.twitter.com', { reqheaders: { Authorization: /^OAuth.*oauth_consumer_key="TWITTER_CONSUMER_KEY".*oauth_token="TWITTER_USER".*$/ } })
					.get('/1.1/users/show.json')
					.query({ screen_name: 'ACCOUNT_ID' })
					.reply(401, { statusCode: 401, errors: [{ code: 89, message: 'Invalid or expired token.' }] });

				twitter.account({ id: 'ACCOUNT_ID', user: 'TWITTER_USER' }, function(err) {
					expect(err).to.eql({ message: 'Twitter User Show - Invalid or expired token.', status: 401 });
					expect(secrets).not.to.have.property('TWITTER_USER');
					done();
				});
			});

			it('should 401 on 401 with no code', function(done) {
				user_show_endpoint.reply(401, { statusCode: 401, request: '/1.1/users/show.json', error: 'Not authorized.' });

				twitter.account({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Twitter User Show - Not authorized.', status: 401 });
					expect(secrets).to.have.property('TWITTER_USER');
					done();
				});
			});

			it('should 403 on 401 with user and no code', function(done) {
				nock('https://api.twitter.com', { reqheaders: { Authorization: /^OAuth.*oauth_consumer_key="TWITTER_CONSUMER_KEY".*oauth_token="TWITTER_USER".*$/ } })
					.get('/1.1/users/show.json')
					.query({ screen_name: 'ACCOUNT_ID' })
					.reply(401, { statusCode: 401, request: '/1.1/users/show.json', error: 'Not authorized.' });

				twitter.account({ id: 'ACCOUNT_ID', user: 'TWITTER_USER' }, function(err) {
					expect(err).to.eql({ message: 'Twitter User Show - Not authorized.', status: 403 });
					expect(secrets).to.have.property('TWITTER_USER');
					done();
				});
			});

			it('should 403 on Protected Account', function(done) {
				user_show_endpoint.reply(403, { statusCode: 403, errors: [{ code: 179, message: 'Sorry, you are not authorized to see this status.' }] });

				twitter.account({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Twitter User Show - Sorry, you are not authorized to see this status.', status: 403 });
					done();
				});
			});

			it('should 404 on 404', function(done) {
				user_show_endpoint.reply(404, { statusCode: 404, errors: [] });

				twitter.account({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Twitter User Show - Twitter API Error', status: 404 });
					done();
				});
			});

			it('should 429 on 429', function(done) {
				user_show_endpoint.reply(429, { statusCode: 429, errors: [] });

				twitter.account({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Twitter User Show - Twitter API Error', status: 429 });
					done();
				});
			});

			it('should 500 on 4xx', function(done) {
				user_show_endpoint.reply(478, { statusCode: 478, errors: [] });

				twitter.account({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Twitter User Show - Twitter API Error', status: 500, original_status: 478 });
					done();
				});
			});

			it('should 502 on 5xx', function(done) {
				user_show_endpoint.reply(578, { statusCode: 578, errors: [] });

				twitter.account({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Twitter User Show - Twitter API Error', status: 502, original_status: 578 });
					done();
				});
			});
		});
	});

	describe('.account_content', function() {
		var statuses_user_timeline_endpoint;
		var default_statuses_user_timeline;

		beforeEach(function() {
			statuses_user_timeline_endpoint = nock('https://api.twitter.com', { reqheaders: { Authorization: /^OAuth.*oauth_consumer_key="TWITTER_CONSUMER_KEY".*oauth_token="APP_TOKEN".*$/ } })
				.get('/1.1/statuses/user_timeline.json')
				.query({ screen_name: 'ACCOUNT_ID', count: config.counts.listed });

			default_statuses_user_timeline = [{ created_at:     'Wed Jun 06 20:07:10 +0000 2012', id_str:         'CONTENT_ID_1', text:           'TEXT 1', retweet_count:  1002, favorite_count: 1001 }, { created_at:     'Wed Jun 06 20:07:10 +0000 2012', id_str:         'CONTENT_ID_2', text:           'TEXT 2', retweet_count:  2002, favorite_count: 2001 }];
		});

		it('should callback twitter tweets', function(done) {
			statuses_user_timeline_endpoint.reply(200, default_statuses_user_timeline);

			twitter.account_content({ id: 'ACCOUNT_ID' }, function(err, account_content) {
				expect(err).not.to.be.ok;
				expect(account_content).to.eql({ api:     'twitter', type:    'account_content', id:      'ACCOUNT_ID', content: [{ api:   'twitter', type:  'content', id:    'CONTENT_ID_1', text:  'TEXT 1', date:  1339013230000, stats: { likes:   1001, reposts: 1002 } }, { api:   'twitter', type:  'content', id:    'CONTENT_ID_2', text:  'TEXT 2', date:  1339013230000, stats: { likes:   2001, reposts: 2002 } }] });
				done();
			});
		});

		it('should replace newlines with linebreaks in the text', function(done) {
			default_statuses_user_timeline[0].text = 'TE\nXT 1';
			default_statuses_user_timeline[1].text = 'TE\nXT 2';
			statuses_user_timeline_endpoint.reply(200, default_statuses_user_timeline);

			twitter.account_content({ id: 'ACCOUNT_ID' }, function(err, account_content) {
				expect(err).not.to.be.ok;
				expect(account_content).to.have.deep.property('content[0].text', 'TE<br>XT 1');
				expect(account_content).to.have.deep.property('content[1].text', 'TE<br>XT 2');
				done();
			});
		});

		it('should replace hashtags with links in the text', function(done) {
			default_statuses_user_timeline[0].text = '#thing';
			default_statuses_user_timeline[1].text = '#thing2';
			statuses_user_timeline_endpoint.reply(200, default_statuses_user_timeline);

			twitter.account_content({ id: 'ACCOUNT_ID' }, function(err, account_content) {
				expect(err).not.to.be.ok;
				expect(account_content).to.have.deep.property('content[0].text', '<a href="https://twitter.com/hashtag/thing" target="_blank">#thing</a>');
				expect(account_content).to.have.deep.property('content[1].text', '<a href="https://twitter.com/hashtag/thing2" target="_blank">#thing2</a>');
				done();
			});
		});

		it('should replace accounts with links in the text', function(done) {
			default_statuses_user_timeline[0].text = '@ACCOUNT_ID_1';
			default_statuses_user_timeline[1].text = '@ACCOUNT_ID_2';
			statuses_user_timeline_endpoint.reply(200, default_statuses_user_timeline);

			twitter.account_content({ id: 'ACCOUNT_ID' }, function(err, account_content) {
				expect(err).not.to.be.ok;
				expect(account_content).to.have.deep.property('content[0].text', '<a href="https://twitter.com/ACCOUNT_ID_1" target="_blank">@ACCOUNT_ID_1</a>');
				expect(account_content).to.have.deep.property('content[1].text', '<a href="https://twitter.com/ACCOUNT_ID_2" target="_blank">@ACCOUNT_ID_2</a>');
				done();
			});
		});

		it('should replace urls with links in the text from entity', function(done) {
			default_statuses_user_timeline[0].text = 'https://t.co/MjJ8xAnT';
			default_statuses_user_timeline[1].text = 'https://t.co/TnAx8JjM';
			default_statuses_user_timeline[0].entities = { urls: [{ expanded_url: 'https://www.hovercards.com', display_url: 'hovercards.com', url: 'https://t.co/MjJ8xAnT' }] };
			default_statuses_user_timeline[1].entities = { urls: [{ expanded_url: 'https://www.wenoknow.com', display_url: 'wenoknow.com', url: 'https://t.co/TnAx8JjM' }] };
			statuses_user_timeline_endpoint.reply(200, default_statuses_user_timeline);

			twitter.account_content({ id: 'ACCOUNT_ID' }, function(err, account_content) {
				expect(err).not.to.be.ok;
				expect(account_content).to.have.deep.property('content[0].text', '<a href="https://www.hovercards.com" target="_blank">hovercards.com</a>');
				expect(account_content).to.have.deep.property('content[1].text', '<a href="https://www.wenoknow.com" target="_blank">wenoknow.com</a>');
				done();
			});
		});

		it('should reference image', function(done) {
			default_statuses_user_timeline[0].text = 'TEXT 1 https://t.co/MjJ8xAnT';
			default_statuses_user_timeline[1].text = 'TEXT 2 https://t.co/TnAx8JjM';
			default_statuses_user_timeline[0].entities = { media: [{ media_url_https: 'image_1.jpg', url:             'https://t.co/MjJ8xAnT', type:            'photo' }] };
			default_statuses_user_timeline[1].entities = { media: [{ media_url_https: 'image_2.jpg', url:             'https://t.co/TnAx8JjM', type:            'photo' }] };
			default_statuses_user_timeline[0].extended_entities = { media: [{ media_url_https: 'image_1.jpg', url:             'https://t.co/MjJ8xAnT', type:            'photo' }] };
			default_statuses_user_timeline[1].extended_entities = { media: [{ media_url_https: 'image_2.jpg', url:             'https://t.co/TnAx8JjM', type:            'photo' }] };
			statuses_user_timeline_endpoint.reply(200, default_statuses_user_timeline);

			twitter.account_content({ id: 'ACCOUNT_ID' }, function(err, account_content) {
				expect(err).not.to.be.ok;
				expect(account_content).to.have.deep.property('content[0].text', 'TEXT 1 ');
				expect(account_content).to.have.deep.property('content[0].image').that.eql({ small:  'image_1.jpg:small', medium: 'image_1.jpg:medium', large:  'image_1.jpg:large' });
				expect(account_content).to.have.deep.property('content[1].text', 'TEXT 2 ');
				expect(account_content).to.have.deep.property('content[1].image').that.eql({ small:  'image_2.jpg:small', medium: 'image_2.jpg:medium', large:  'image_2.jpg:large' });
				done();
			});
		});

		it('should reference images', function(done) {
			default_statuses_user_timeline[0].text = 'TEXT 1 https://t.co/MjJ8xAnT';
			default_statuses_user_timeline[1].text = 'TEXT 2 https://t.co/TnAx8JjM';
			default_statuses_user_timeline[0].entities = { media: [{ media_url_https: 'image_1_1.jpg', url:             'https://t.co/MjJ8xAnT', type:            'photo' }] };
			default_statuses_user_timeline[1].entities = { media: [{ media_url_https: 'image_2_1.jpg', url:             'https://t.co/TnAx8JjM', type:            'photo' }] };
			default_statuses_user_timeline[0].extended_entities = { media: [{ media_url_https: 'image_1_1.jpg', url:             'https://t.co/MjJ8xAnT', type:            'photo' }, { media_url_https: 'image_1_2.jpg', url:             'https://t.co/MjJ8xAnT', type:            'photo' }] };
			default_statuses_user_timeline[1].extended_entities = { media: [{ media_url_https: 'image_2_1.jpg', url:             'https://t.co/TnAx8JjM', type:            'photo' }, { media_url_https: 'image_2_2.jpg', url:             'https://t.co/TnAx8JjM', type:            'photo' }] };
			statuses_user_timeline_endpoint.reply(200, default_statuses_user_timeline);

			twitter.account_content({ id: 'ACCOUNT_ID' }, function(err, account_content) {
				expect(err).not.to.be.ok;
				expect(account_content).to.have.deep.property('content[0].text', 'TEXT 1 ');
				expect(account_content).not.to.have.deep.property('content[0].image'),
				expect(account_content).to.have.deep.property('content[0].images').that.eql([{ small:  'image_1_1.jpg:small', medium: 'image_1_1.jpg:medium', large:  'image_1_1.jpg:large' }, { small:  'image_1_2.jpg:small', medium: 'image_1_2.jpg:medium', large:  'image_1_2.jpg:large' }]);
				expect(account_content).to.have.deep.property('content[1].text', 'TEXT 2 ');
				expect(account_content).not.to.have.deep.property('content[1].image'),
				expect(account_content).to.have.deep.property('content[1].images').that.eql([{ small:  'image_2_1.jpg:small', medium: 'image_2_1.jpg:medium', large:  'image_2_1.jpg:large' }, { small:  'image_2_2.jpg:small', medium: 'image_2_2.jpg:medium', large:  'image_2_2.jpg:large' }]);
				done();
			});
		});

		it('should reference gif', function(done) {
			default_statuses_user_timeline[0].text = 'TEXT 1 https://t.co/MjJ8xAnT';
			default_statuses_user_timeline[1].text = 'TEXT 2 https://t.co/TnAx8JjM';
			default_statuses_user_timeline[0].entities = { media: [{ media_url_https: 'image_1.jpg', url:             'https://t.co/MjJ8xAnT', type:            'photo' }] };
			default_statuses_user_timeline[1].entities = { media: [{ media_url_https: 'image_2.jpg', url:             'https://t.co/TnAx8JjM', type:            'photo' }] };
			default_statuses_user_timeline[0].extended_entities = { media: [{ media_url_https: 'image_1.jpg', url:             'https://t.co/MjJ8xAnT', type:            'animated_gif', video_info:      { variants: [{ content_type: 'video/mp4', url:          'gif_1.mp4', }] } }] };
			default_statuses_user_timeline[1].extended_entities = { media: [{ media_url_https: 'image_2.jpg', url:             'https://t.co/TnAx8JjM', type:            'animated_gif', video_info:      { variants: [{ content_type: 'video/mp4', url:          'gif_2.mp4', }] } }] };
			statuses_user_timeline_endpoint.reply(200, default_statuses_user_timeline);

			twitter.account_content({ id: 'ACCOUNT_ID' }, function(err, account_content) {
				expect(err).not.to.be.ok;
				expect(account_content).to.have.deep.property('content[0].text', 'TEXT 1 ');
				expect(account_content).to.have.deep.property('content[0].image').that.eql({ small:  'image_1.jpg:small', medium: 'image_1.jpg:medium', large:  'image_1.jpg:large' });
				expect(account_content).to.have.deep.property('content[0].gif').that.eql('gif_1.mp4');
				expect(account_content).to.have.deep.property('content[1].text', 'TEXT 2 ');
				expect(account_content).to.have.deep.property('content[1].image').that.eql({ small:  'image_2.jpg:small', medium: 'image_2.jpg:medium', large:  'image_2.jpg:large' });
				expect(account_content).to.have.deep.property('content[1].gif').that.eql('gif_2.mp4');
				done();
			});
		});

		it('should reference video', function(done) {
			default_statuses_user_timeline[0].text = 'TEXT 1 https://t.co/MjJ8xAnT';
			default_statuses_user_timeline[0].extended_entities = { media: [{ media_url_https: 'image_1.jpg', url:             'https://t.co/MjJ8xAnT', type:            'video', video_info:      { variants: [{ content_type: 'video/mp4', url:          'video_1.mp4', }] } }] };
			default_statuses_user_timeline[1].text = 'TEXT 2 https://t.co/TnAx8JjM';
			default_statuses_user_timeline[1].extended_entities = { media: [{ media_url_https: 'image_2.jpg', url:             'https://t.co/TnAx8JjM', type:            'video', video_info:      { variants: [{ content_type: 'video/mp4', url:          'video_2.mp4', }] } }] };
			statuses_user_timeline_endpoint.reply(200, default_statuses_user_timeline);

			twitter.account_content({ id: 'ACCOUNT_ID' }, function(err, account_content) {
				expect(err).not.to.be.ok;
				expect(account_content).to.have.deep.property('content[0].text', 'TEXT 1 ');
				expect(account_content).to.have.deep.property('content[0].image').that.eql({ small:  'image_1.jpg:small', medium: 'image_1.jpg:medium', large:  'image_1.jpg:large' });
				expect(account_content).to.have.deep.property('content[0].video').that.eql('video_1.mp4');
				expect(account_content).to.have.deep.property('content[1].text', 'TEXT 2 ');
				expect(account_content).to.have.deep.property('content[1].image').that.eql({ small:  'image_2.jpg:small', medium: 'image_2.jpg:medium', large:  'image_2.jpg:large' });
				expect(account_content).to.have.deep.property('content[1].video').that.eql('video_2.mp4');
				done();
			});
		});

		describe('on retweets', function() {
			beforeEach(function() {
				default_statuses_user_timeline = [{ created_at:       'Wed Jun 06 20:07:10 +0000 2012', id_str:           'CONTENT_ID_1', text:             'RT TEXT 1', retweet_count:    1002, favorite_count:   1001, retweeted_status: { created_at:     'Wed Jun 05 20:07:10 +0000 2012', id_str:         'CONTENT_ID_1_1', text:           'TEXT 1', retweet_count:  1002, favorite_count: 1001, user:           { screen_name:             'ACCOUNT_ID_1', profile_image_url_https: 'image_1_normal.png', name:                    'NAME 1' } } }, { created_at:       'Wed Jun 06 20:07:10 +0000 2012', id_str:           'CONTENT_ID_2', text:             'RT TEXT 2', retweet_count:    2002, favorite_count:   2001, retweeted_status: { created_at:     'Wed Jun 05 20:07:10 +0000 2012', id_str:         'CONTENT_ID_2_1', text:           'TEXT 2', retweet_count:  2002, favorite_count: 2001, user:           { screen_name:             'ACCOUNT_ID_2', profile_image_url_https: 'image_2_normal.png', name:                    'NAME 2' } } }];
			});

			it('should callback with retweeted tweets', function(done) {
				statuses_user_timeline_endpoint.reply(200, default_statuses_user_timeline);

				twitter.account_content({ id: 'ACCOUNT_ID' }, function(err, account_content) {
					expect(err).not.to.be.ok;
					expect(account_content).to.eql({ api:     'twitter', type:    'account_content', id:      'ACCOUNT_ID', content: [{ api:              'twitter', type:             'content', id:               'CONTENT_ID_1', date:             1339013230000, reposted_content: { api:     'twitter', type:    'content', id:      'CONTENT_ID_1_1', text:    'TEXT 1', date:    1338926830000, stats:   { likes:   1001, reposts: 1002 }, account: { api:   'twitter', type:  'account', id:    'ACCOUNT_ID_1', name:  'NAME 1', image: { small: 'image_1_bigger.png', large: 'image_1.png' } } } }, { api:              'twitter', type:             'content', id:               'CONTENT_ID_2', date:             1339013230000, reposted_content: { api:     'twitter', type:    'content', id:      'CONTENT_ID_2_1', text:    'TEXT 2', date:    1338926830000, stats:   { likes:   2001, reposts: 2002 }, account: { api:   'twitter', type:  'account', id:    'ACCOUNT_ID_2', name:  'NAME 2', image: { small: 'image_2_bigger.png', large: 'image_2.png' } } } }] });
					done();
				});
			});
		});

		describe('on quotes', function() {
			beforeEach(function() {
				default_statuses_user_timeline = [{ created_at:     'Wed Jun 06 20:07:10 +0000 2012', id_str:         'CONTENT_ID_1', text:           'TEXT 1 https://t.co/4VL91iY8Dn', retweet_count:  1020, favorite_count: 1010, quoted_status:  { created_at:     'Wed Jun 05 20:07:10 +0000 2012', id_str:         'CONTENT_ID_1_1', text:           'TEXT 1_1', retweet_count:  1021, favorite_count: 1011, user:           { screen_name:             'ACCOUNT_ID_1', profile_image_url_https: 'image_1_normal.png', name:                    'NAME 1' } }, entities:       { urls: [{ expanded_url: 'https://twitter.com/ACCOUNT_ID_1/status/CONTENT_ID_1_1', display_url:  'twitter.com/ACCOUNT_ID_1/status/CONTENT_ID_1_1', url:          'https://t.co/4VL91iY8Dn' }] } }, { created_at:     'Wed Jun 06 20:07:10 +0000 2012', id_str:         'CONTENT_ID_2', text:           'TEXT 2 https://t.co/L91iY8DnV4', retweet_count:  2020, favorite_count: 2010, quoted_status:  { created_at:     'Wed Jun 05 20:07:10 +0000 2012', id_str:         'CONTENT_ID_2_1', text:           'TEXT 2_1', retweet_count:  2021, favorite_count: 2011, user:           { screen_name:             'ACCOUNT_ID_2', profile_image_url_https: 'image_2_normal.png', name:                    'NAME 2' } }, entities:       { urls: [{ expanded_url: 'https://twitter.com/ACCOUNT_ID_2/status/CONTENT_ID_2_1', display_url:  'twitter.com/ACCOUNT_ID_2/status/CONTENT_ID_2_1', url:          'https://t.co/L91iY8DnV4' }] } }];
			});

			it('should callback with quoted tweets', function(done) {
				statuses_user_timeline_endpoint.reply(200, default_statuses_user_timeline);

				twitter.account_content({ id: 'ACCOUNT_ID' }, function(err, account_content) {
					expect(err).not.to.be.ok;
					expect(account_content).to.eql({ api:     'twitter', type:    'account_content', id:      'ACCOUNT_ID', content: [{ api:            'twitter', type:           'content', id:             'CONTENT_ID_1', text:           'TEXT 1 ', date:           1339013230000, stats:          { likes:   1010, reposts: 1020 }, quoted_content: { api:     'twitter', type:    'content', id:      'CONTENT_ID_1_1', text:    'TEXT 1_1', date:    1338926830000, stats:   { likes:   1011, reposts: 1021 }, account: { api:   'twitter', type:  'account', id:    'ACCOUNT_ID_1', name:  'NAME 1', image: { small: 'image_1_bigger.png', large: 'image_1.png' } } } }, { api:            'twitter', type:           'content', id:             'CONTENT_ID_2', text:           'TEXT 2 ', date:           1339013230000, stats:          { likes:   2010, reposts: 2020 }, quoted_content: { api:     'twitter', type:    'content', id:      'CONTENT_ID_2_1', text:    'TEXT 2_1', date:    1338926830000, stats:   { likes:   2011, reposts: 2021 }, account: { api:   'twitter', type:  'account', id:    'ACCOUNT_ID_2', name:  'NAME 2', image: { small: 'image_2_bigger.png', large: 'image_2.png' } } } }] });
					done();
				});
			});
		});

		describe('on replies', function() {
			var statuses_show_content_1_1_endpoint;
			var statuses_show_content_2_1_endpoint;
			var default_statuses_show_content_1_1;
			var default_statuses_show_content_2_1;

			beforeEach(function() {
				statuses_show_content_1_1_endpoint = nock('https://api.twitter.com', { reqheaders: { Authorization: /^OAuth.*oauth_consumer_key="TWITTER_CONSUMER_KEY".*oauth_token="APP_TOKEN".*$/ } })
					.get('/1.1/statuses/show/CONTENT_ID_1_1.json');
				statuses_show_content_2_1_endpoint = nock('https://api.twitter.com', { reqheaders: { Authorization: /^OAuth.*oauth_consumer_key="TWITTER_CONSUMER_KEY".*oauth_token="APP_TOKEN".*$/ } })
					.get('/1.1/statuses/show/CONTENT_ID_2_1.json');

				default_statuses_user_timeline = [{ created_at:                'Wed Jun 06 20:07:10 +0000 2012', id_str:                    'CONTENT_ID_1', text:                      'TEXT 1', retweet_count:             1020, favorite_count:            1010, in_reply_to_status_id_str: 'CONTENT_ID_1_1', in_reply_to_screen_name:   'ACCOUNT_ID_1' }, { created_at:                'Wed Jun 06 20:07:10 +0000 2012', id_str:                    'CONTENT_ID_2', text:                      'TEXT 2', retweet_count:             2020, favorite_count:            2010, in_reply_to_status_id_str: 'CONTENT_ID_2_1', in_reply_to_screen_name:   'ACCOUNT_ID_2' }];
				default_statuses_show_content_1_1 = { created_at:     'Wed Jun 05 20:07:10 +0000 2012', id_str:         'CONTENT_ID_1_1', text:           'TEXT 1_1', retweet_count:  1021, favorite_count: 1011, user:           { screen_name:             'ACCOUNT_ID_1', profile_image_url_https: 'image_1_normal.png', name:                    'NAME 1' } };
				default_statuses_show_content_2_1 = { created_at:     'Wed Jun 05 20:07:10 +0000 2012', id_str:         'CONTENT_ID_2_1', text:           'TEXT 2_1', retweet_count:  2021, favorite_count: 2011, user:           { screen_name:             'ACCOUNT_ID_2', profile_image_url_https: 'image_2_normal.png', name:                    'NAME 2' } };
			});

			it('should callback with replied to tweets', function(done) {
				statuses_user_timeline_endpoint.reply(200, default_statuses_user_timeline);
				statuses_show_content_1_1_endpoint.reply(200, default_statuses_show_content_1_1);
				statuses_show_content_2_1_endpoint.reply(200, default_statuses_show_content_2_1);

				twitter.account_content({ id: 'ACCOUNT_ID' }, function(err, account_content) {
					expect(err).not.to.be.ok;
					expect(account_content).to.eql({ api:     'twitter', type:    'account_content', id:      'ACCOUNT_ID', content: [{ api:                'twitter', type:               'content', id:                 'CONTENT_ID_1', text:               'TEXT 1', date:               1339013230000, stats:              { likes:   1010, reposts: 1020 }, replied_to_content: { api:     'twitter', type:    'content', id:      'CONTENT_ID_1_1', text:    'TEXT 1_1', date:    1338926830000, stats:   { likes:   1011, reposts: 1021 }, account: { api:   'twitter', type:  'account', id:    'ACCOUNT_ID_1', name:  'NAME 1', image: { small: 'image_1_bigger.png', large: 'image_1.png' } } } }, { api:                'twitter', type:               'content', id:                 'CONTENT_ID_2', text:               'TEXT 2', date:               1339013230000, stats:              { likes:   2010, reposts: 2020 }, replied_to_content: { api:     'twitter', type:    'content', id:      'CONTENT_ID_2_1', text:    'TEXT 2_1', date:    1338926830000, stats:   { likes:   2011, reposts: 2021 }, account: { api:   'twitter', type:  'account', id:    'ACCOUNT_ID_2', name:  'NAME 2', image: { small: 'image_2_bigger.png', large: 'image_2.png' } } } }] });
					done();
				});
			});

			it('should callback with tweets in a conversation', function(done) {
				default_statuses_show_content_2_1.in_reply_to_status_id_str = 'CONTENT_ID_1';
				default_statuses_show_content_2_1.in_reply_to_screen_name = 'ACCOUNT_ID';
				statuses_user_timeline_endpoint.reply(200, default_statuses_user_timeline);
				statuses_show_content_1_1_endpoint.reply(200, default_statuses_show_content_1_1);
				statuses_show_content_2_1_endpoint.reply(200, default_statuses_show_content_2_1);

				twitter.account_content({ id: 'ACCOUNT_ID' }, function(err, account_content) {
					expect(err).not.to.be.ok;
					expect(account_content).to.eql({ api:     'twitter', type:    'account_content', id:      'ACCOUNT_ID', content: [{ api:                'twitter', type:               'content', id:                 'CONTENT_ID_2', text:               'TEXT 2', date:               1339013230000, stats:              { likes:   2010, reposts: 2020 }, replied_to_content: { api:                'twitter', type:               'content', id:                 'CONTENT_ID_2_1', text:               'TEXT 2_1', date:               1338926830000, stats:              { likes:   2011, reposts: 2021 }, account:            { api:   'twitter', type:  'account', id:    'ACCOUNT_ID_2', name:  'NAME 2', image: { small: 'image_2_bigger.png', large: 'image_2.png' } }, replied_to_content: { api:                'twitter', type:               'content', id:                 'CONTENT_ID_1', text:               'TEXT 1', date:               1339013230000, stats:              { likes:   1010, reposts: 1020 }, replied_to_content: { api:     'twitter', type:    'content', id:      'CONTENT_ID_1_1', text:    'TEXT 1_1', date:    1338926830000, stats:   { likes:   1011, reposts: 1021 }, account: { api:   'twitter', type:  'account', id:    'ACCOUNT_ID_1', name:  'NAME 1', image: { small: 'image_1_bigger.png', large: 'image_1.png' } } } } } }] });
					done();
				});
			});

			it('should callback with the same tweet multiple times when replied to multiple times', function(done) {
				default_statuses_user_timeline[1].in_reply_to_status_id_str = 'CONTENT_ID_1_1';
				default_statuses_user_timeline[1].in_reply_to_screen_name = 'ACCOUNT_ID_1';
				statuses_user_timeline_endpoint.reply(200, default_statuses_user_timeline);
				statuses_show_content_1_1_endpoint.reply(200, default_statuses_show_content_1_1);
				statuses_show_content_2_1_endpoint.reply(200, default_statuses_show_content_2_1);

				twitter.account_content({ id: 'ACCOUNT_ID' }, function(err, account_content) {
					expect(err).not.to.be.ok;
					expect(account_content).to.eql({ api:     'twitter', type:    'account_content', id:      'ACCOUNT_ID', content: [{ api:                'twitter', type:               'content', id:                 'CONTENT_ID_1', text:               'TEXT 1', date:               1339013230000, stats:              { likes:   1010, reposts: 1020 }, replied_to_content: { api:     'twitter', type:    'content', id:      'CONTENT_ID_1_1', text:    'TEXT 1_1', date:    1338926830000, stats:   { likes:   1011, reposts: 1021 }, account: { api:   'twitter', type:  'account', id:    'ACCOUNT_ID_1', name:  'NAME 1', image: { small: 'image_1_bigger.png', large: 'image_1.png' } } } }, { api:                'twitter', type:               'content', id:                 'CONTENT_ID_2', text:               'TEXT 2', date:               1339013230000, stats:              { likes:   2010, reposts: 2020 }, replied_to_content: { api:     'twitter', type:    'content', id:      'CONTENT_ID_1_1', text:    'TEXT 1_1', date:    1338926830000, stats:   { likes:   1011, reposts: 1021 }, account: { api:   'twitter', type:  'account', id:    'ACCOUNT_ID_1', name:  'NAME 1', image: { small: 'image_1_bigger.png', large: 'image_1.png' } } } }] });
					done();
				});
			});

			describe('usage', function() {
				it('should report', function(done) {
					statuses_user_timeline_endpoint.reply(200, default_statuses_user_timeline);
					statuses_show_content_1_1_endpoint.reply(200, default_statuses_show_content_1_1);
					statuses_show_content_2_1_endpoint.reply(200, default_statuses_show_content_2_1);

					twitter.account_content({ id: 'ACCOUNT_ID' }, function(err, account_content, usage) {
						expect(usage).to.have.property('twitter-statuses-show-calls', 2);
						expect(usage).to.have.property('twitter-statuses-user-timeline-calls', 1);
						done();
					});
				});
			});

			describe('statuses show timeline endpoint', function() {
				it('should not err on xxx', function(done) {
					statuses_user_timeline_endpoint.reply(200, default_statuses_user_timeline);
					statuses_show_content_1_1_endpoint.reply(200, default_statuses_show_content_1_1);
					statuses_show_content_2_1_endpoint.reply(404, { statusCode: 404, errors: [] });

					twitter.account_content({ id: 'ACCOUNT_ID' }, function(err, account_content) {
						expect(err).not.to.be.ok;
						expect(account_content).not.to.have.deep.property('content[1].replied_to_content');
						done();
					});
				});
			});
		});

		describe('usage', function() {
			it('should report', function(done) {
				statuses_user_timeline_endpoint.reply(200, default_statuses_user_timeline);

				twitter.account_content({ id: 'ACCOUNT_ID' }, function(err, account_content, usage) {
					expect(usage).to.have.property('twitter-statuses-show-calls', 0);
					expect(usage).to.have.property('twitter-statuses-user-timeline-calls', 1);
					done();
				});
			});
		});

		describe('statuses user timeline endpoint', function() {
			it('should 401 on Unknown Token', function(done) {
				nock('https://api.twitter.com', { reqheaders: { Authorization: /^OAuth.*oauth_consumer_key="TWITTER_CONSUMER_KEY".*oauth_token="TWITTER_USER".*$/ } })
					.get('/1.1/statuses/user_timeline.json')
					.query({ screen_name: 'ACCOUNT_ID', count: config.counts.listed })
					.reply(200, default_statuses_user_timeline);

				delete secrets.TWITTER_USER;

				twitter.account_content({ id: 'ACCOUNT_ID', user: 'TWITTER_USER' }, function(err, account_content, usage) {
					expect(err).to.eql({ message: 'Twitter Statuses User Timeline', status: 401 });
					expect(usage).to.have.property('twitter-statuses-show-calls', 0);
					expect(usage).to.have.property('twitter-statuses-user-timeline-calls', 0);
					done();
				});
			});

			it('should 401 on Invalid/Expired Token', function(done) {
				nock('https://api.twitter.com', { reqheaders: { Authorization: /^OAuth.*oauth_consumer_key="TWITTER_CONSUMER_KEY".*oauth_token="TWITTER_USER".*$/ } })
					.get('/1.1/statuses/user_timeline.json')
					.query({ screen_name: 'ACCOUNT_ID', count: config.counts.listed })
					.reply(401, { statusCode: 401, errors: [{ code: 89, message: 'Invalid or expired token.' }] });

				twitter.account_content({ id: 'ACCOUNT_ID', user: 'TWITTER_USER' }, function(err) {
					expect(err).to.eql({ message: 'Twitter Statuses User Timeline - Invalid or expired token.', status: 401 });
					expect(secrets).not.to.have.property('TWITTER_USER');
					done();
				});
			});

			it('should 401 on 401 with no code', function(done) {
				statuses_user_timeline_endpoint.reply(401, { statusCode: 401, request: '/1.1/users/show.json', error: 'Not authorized.' });

				twitter.account_content({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Twitter Statuses User Timeline - Not authorized.', status: 401 });
					expect(secrets).to.have.property('TWITTER_USER');
					done();
				});
			});

			it('should 403 on 401 with user and no code', function(done) {
				nock('https://api.twitter.com', { reqheaders: { Authorization: /^OAuth.*oauth_consumer_key="TWITTER_CONSUMER_KEY".*oauth_token="TWITTER_USER".*$/ } })
					.get('/1.1/statuses/user_timeline.json')
					.query({ screen_name: 'ACCOUNT_ID', count: config.counts.listed })
					.reply(401, { statusCode: 401, request: '/1.1/users/show.json', error: 'Not authorized.' });

				twitter.account_content({ id: 'ACCOUNT_ID', user: 'TWITTER_USER' }, function(err) {
					expect(err).to.eql({ message: 'Twitter Statuses User Timeline - Not authorized.', status: 403 });
					expect(secrets).to.have.property('TWITTER_USER');
					done();
				});
			});

			it('should 403 on Protected Account', function(done) {
				statuses_user_timeline_endpoint.reply(403, { statusCode: 403, errors: [{ code: 179, message: 'Sorry, you are not authorized to see this status.' }] });

				twitter.account_content({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Twitter Statuses User Timeline - Sorry, you are not authorized to see this status.', status: 403 });
					done();
				});
			});

			it('should 404 on 404', function(done) {
				statuses_user_timeline_endpoint.reply(404, { statusCode: 404, errors: [] });

				twitter.account_content({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Twitter Statuses User Timeline - Twitter API Error', status: 404 });
					done();
				});
			});

			it('should 429 on 429', function(done) {
				statuses_user_timeline_endpoint.reply(429, { statusCode: 429, errors: [] });

				twitter.account_content({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Twitter Statuses User Timeline - Twitter API Error', status: 429 });
					done();
				});
			});

			it('should 500 on 4xx', function(done) {
				statuses_user_timeline_endpoint.reply(478, { statusCode: 478, errors: [] });

				twitter.account_content({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Twitter Statuses User Timeline - Twitter API Error', status: 500, original_status: 478 });
					done();
				});
			});

			it('should 502 on 5xx', function(done) {
				statuses_user_timeline_endpoint.reply(578, { statusCode: 578, errors: [] });

				twitter.account_content({ id: 'ACCOUNT_ID' }, function(err) {
					expect(err).to.eql({ message: 'Twitter Statuses User Timeline - Twitter API Error', status: 502, original_status: 578 });
					done();
				});
			});
		});
	});
});

describe('twitter urls', function() {
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
			it('from twitter.com/ACCOUNT_ID/status/CONTENT_ID', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/ACCOUNT_ID/status/CONTENT_ID', true, true)))
					.to.eql({ api:     'twitter', type:    'content', id:      'CONTENT_ID', account: { api:  'twitter', type: 'account', id:   'ACCOUNT_ID' } });
			});

			it('from twitter.com/ACCOUNT_ID/statuses/CONTENT_ID', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/ACCOUNT_ID/statuses/CONTENT_ID', true, true)))
					.to.eql({ api:     'twitter', type:    'content', id:      'CONTENT_ID', account: { api:  'twitter', type: 'account', id:   'ACCOUNT_ID' } });
			});

			it('from twitter.com/#!/ACCOUNT_ID/status/CONTENT_ID', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/#!/ACCOUNT_ID/status/CONTENT_ID', true, true)))
					.to.eql({ api:     'twitter', type:    'content', id:      'CONTENT_ID', account: { api:  'twitter', type: 'account', id:   'ACCOUNT_ID' } });
			});

			it('from twitter.com/#!/ACCOUNT_ID/statuses/CONTENT_ID', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/#!/ACCOUNT_ID/statuses/CONTENT_ID', true, true)))
					.to.eql({ api:     'twitter', type:    'content', id:      'CONTENT_ID', account: { api:  'twitter', type: 'account', id:   'ACCOUNT_ID' } });
			});

			it('from twitter.com/intent/tweet?in_reply_to=CONTENT_ID', function() {
				expect(urls.parse(url.parse('https://twitter.com/intent/tweet?in_reply_to=CONTENT_ID', true, true)))
					.to.eql({ api: 'twitter', type: 'content', id: 'CONTENT_ID' });
			});

			it('from twitter.com/intent/retweet?tweet_id=CONTENT_ID', function() {
				expect(urls.parse(url.parse('https://twitter.com/intent/retweet?tweet_id=CONTENT_ID', true, true)))
					.to.eql({ api: 'twitter', type: 'content', id: 'CONTENT_ID' });
			});

			it('from twitter.com/intent/favorite?tweet_id=CONTENT_ID', function() {
				expect(urls.parse(url.parse('https://twitter.com/intent/favorite?tweet_id=CONTENT_ID', true, true)))
					.to.eql({ api: 'twitter', type: 'content', id: 'CONTENT_ID' });
			});
		});

		describe('into account', function() {
			it('from twitter.com/ACCOUNT_ID', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/ACCOUNT_ID', true, true)))
					.to.eql({ api: 'twitter', type: 'account', id: 'ACCOUNT_ID' });
			});

			it('from twitter.com/ACCOUNT_ID/*', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/ACCOUNT_ID/followers', true, true)))
					.to.eql({ api: 'twitter', type: 'account', id: 'ACCOUNT_ID' });
			});

			it('from twitter.com/#!/ACCOUNT_ID', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/#!/ACCOUNT_ID', true, true)))
					.to.eql({ api: 'twitter', type: 'account', id: 'ACCOUNT_ID' });
			});

			it('from twitter.com/#!/ACCOUNT_ID/*', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/#!/ACCOUNT_ID/followers', true, true)))
					.to.eql({ api: 'twitter', type: 'account', id: 'ACCOUNT_ID' });
			});

			it('from twitter.com/intent/user?screen_name=ACCOUNT_ID', function() {
				expect(urls.parse(url.parse('https://twitter.com/intent/user?screen_name=ACCOUNT_ID', true, true)))
					.to.eql({ api: 'twitter', type: 'account', id: 'ACCOUNT_ID' });
			});

			it('from twitter.com/intent/follow?screen_name=ACCOUNT_ID', function() {
				expect(urls.parse(url.parse('https://twitter.com/intent/follow?screen_name=ACCOUNT_ID', true, true)))
					.to.eql({ api: 'twitter', type: 'account', id: 'ACCOUNT_ID' });
			});

			it('not from twitter.com/about', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/about', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/account', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/account', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/accounts', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/accounts', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/activity', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/activity', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/all', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/all', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/announcements', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/announcements', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/anywhere', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/anywhere', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/api_rules', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/api_rules', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/api_terms', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/api_terms', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/apirules', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/apirules', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/apps', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/apps', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/auth', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/auth', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/badges', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/badges', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/blog', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/blog', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/business', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/business', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/buttons', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/buttons', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/contacts', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/contacts', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/devices', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/devices', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/direct_messages', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/direct_messages', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/download', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/download', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/downloads', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/downloads', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/edit_announcements', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/edit_announcements', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/faq', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/faq', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/favorites', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/favorites', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/find_sources', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/find_sources', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/find_users', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/find_users', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/followers', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/followers', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/following', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/following', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/friend_request', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/friend_request', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/friendrequest', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/friendrequest', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/friends', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/friends', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/goodies', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/goodies', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/hashtag/wenoknow', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/hashtag/wenoknow', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/help', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/help', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/home', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/home', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/i/notifications', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/i/notifications', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/im_account', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/im_account', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/inbox', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/inbox', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/invitations', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/invitations', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/invite', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/invite', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/jobs', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/jobs', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/list', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/list', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/login', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/login', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/logo', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/logo', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/logout', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/logout', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/me', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/me', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/media_signup', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/media_signup', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/mentions', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/mentions', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/messages', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/messages', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/mockview', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/mockview', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/newtwitter', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/newtwitter', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/notifications', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/notifications', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/nudge', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/nudge', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/oauth', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/oauth', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/phoenix_search', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/phoenix_search', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/positions', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/positions', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/privacy', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/privacy', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/public_timeline', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/public_timeline', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/related_tweets', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/related_tweets', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/replies', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/replies', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/retweeted_of_mine', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/retweeted_of_mine', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/retweets', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/retweets', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/retweets_by_others', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/retweets_by_others', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/rules', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/rules', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/saved_searches', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/saved_searches', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/search?q="WeNoKnow"', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/search?q="WeNoKnow"', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/sent', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/sent', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/sessions', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/sessions', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/settings/account', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/settings/account', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/share?text=WeNoKnow is cool!&via=WeNoKnow&url=http://www.wenoknow.com', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/share?text=WeNoKnow%20is%20cool!&via=WeNoKnow&url=http://www.wenoknow.com', true, true)))
					.not.to.be.ok;
			});

			it('not from twitter.com/signin', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/signin', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/signup', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/signup', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/similar_to', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/similar_to', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/statistics', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/statistics', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/terms', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/terms', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/tos', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/tos', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/translate', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/translate', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/trends', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/trends', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/tweetbutton', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/tweetbutton', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/twttr', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/twttr', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/update_discoverability', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/update_discoverability', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/users', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/users', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/welcome', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/welcome', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/who_to_follow/suggestions', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/who_to_follow/suggestions', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/widgets', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/widgets', true, true))).not.to.be.ok;
			});

			it('not from twitter.com/zendesk_auth', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/zendesk_auth', true, true))).not.to.be.ok;
			});
		});
	});

	describe('.represent', function() {
		it('should represent content', function() {
			expect(urls.represent({ type: 'content', id: 'CONTENT_ID' })).to.contain('https://twitter.com/screen_name/status/CONTENT_ID');
		});

		it('should represent content with account', function() {
			expect(urls.represent({ type: 'content', id: 'CONTENT_ID', account: { api: 'twitter', type: 'account', id: 'ACCOUNT_ID' } }))
				.to.contain('https://twitter.com/ACCOUNT_ID/status/CONTENT_ID');
		});

		it('should represent account', function() {
			expect(urls.represent({ type: 'account', id: 'ACCOUNT_ID' })).to.contain('https://twitter.com/ACCOUNT_ID');
		});
	});
});
