/* eslint-disable max-nested-callbacks */
var _              = require('underscore');
var chai           = require('chai');
var chaiAsPromised = require('chai-as-promised');
var nock           = require('nock');
var sinon          = require('sinon');
var sinonChai      = require('sinon-chai');
var expect         = chai.expect;
chai.use(chaiAsPromised);
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
				get: function(key) { return Promise.resolve(secrets[key]); },
				set: function(key, value) { secrets[key] = value; return Promise.resolve('OK'); },
				del: function() { _.chain(arguments).initial().each(function(key) { delete secrets[key]; }); return Promise.resolve(arguments.length - 1); }
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

			default_statuses_show = { created_at: 'Wed Jun 05 20:07:10 +0000 2012', id_str: 'CONTENT_ID', text: 'TEXT', retweet_count: 1002, favorite_count: 1001, user: { screen_name: 'ACCOUNT_ID', profile_image_url_https: 'image_normal.png', name: 'NAME' } };
		});

		it('should callback a twitter tweet', function() {
			statuses_show_endpoint.reply(200, default_statuses_show);

			return expect(twitter.content({ id: 'CONTENT_ID' })).to.eventually.eql({ api: 'twitter', type: 'content', id: 'CONTENT_ID', text: 'TEXT', date: 1338926830000, stats: { likes: 1001, reposts: 1002 }, account: { api: 'twitter', type: 'account', id: 'ACCOUNT_ID', name: 'NAME', image: { small: 'image_bigger.png', large: 'image.png' } } });
		});

		it('should replace newlines with linebreaks in the text', function() {
			default_statuses_show.text = 'TE\nXT 1';
			statuses_show_endpoint.reply(200, default_statuses_show);

			return expect(twitter.content({ id: 'CONTENT_ID' })).to.eventually.have.property('text', 'TE<br>XT 1');
		});

		it('should replace hashtags with links in the text', function() {
			default_statuses_show.text = '#thing #thing2';
			statuses_show_endpoint.reply(200, default_statuses_show);

			return expect(twitter.content({ id: 'CONTENT_ID' })).to.eventually.have.property('text', '<a href="https://twitter.com/hashtag/thing" target="_blank" rel="noopener noreferrer">#thing</a> <a href="https://twitter.com/hashtag/thing2" target="_blank" rel="noopener noreferrer">#thing2</a>');
		});

		it('should replace accounts with links in the text', function() {
			default_statuses_show.text = '@ACCOUNT_ID_1 @ACCOUNT_ID_2';
			statuses_show_endpoint.reply(200, default_statuses_show);

			return expect(twitter.content({ id: 'CONTENT_ID' })).to.eventually.have.property('text', '<a href="https://twitter.com/ACCOUNT_ID_1" target="_blank" rel="noopener noreferrer">@ACCOUNT_ID_1</a> <a href="https://twitter.com/ACCOUNT_ID_2" target="_blank" rel="noopener noreferrer">@ACCOUNT_ID_2</a>');
		});

		it('should replace urls with links in the text from entity', function() {
			default_statuses_show.text = 'https://t.co/MjJ8xAnT https://t.co/TnAx8JjM';
			default_statuses_show.entities = { urls: [{ expanded_url: 'https://www.hovercards.com', display_url: 'hovercards.com', url: 'https://t.co/MjJ8xAnT' }, { expanded_url: 'https://www.wenoknow.com', display_url: 'wenoknow.com', url: 'https://t.co/TnAx8JjM' }] };
			statuses_show_endpoint.reply(200, default_statuses_show);

			return expect(twitter.content({ id: 'CONTENT_ID' })).to.eventually.have.property('text', '<a href="https://www.hovercards.com" target="_blank" rel="noopener noreferrer">hovercards.com</a> <a href="https://www.wenoknow.com" target="_blank" rel="noopener noreferrer">wenoknow.com</a>');
		});

		it('should reference image', function() {
			default_statuses_show.text = 'TEXT https://t.co/MjJ8xAnT';
			default_statuses_show.entities = { media: [{ media_url_https: 'image.jpg', url: 'https://t.co/MjJ8xAnT', type: 'photo' }] };
			default_statuses_show.extended_entities = { media: [{ media_url_https: 'image.jpg', url: 'https://t.co/MjJ8xAnT', type: 'photo' }] };
			statuses_show_endpoint.reply(200, default_statuses_show);

			var promise = twitter.content({ id: 'CONTENT_ID' });

			return Promise.all([
				expect(promise).to.eventually.have.property('text', 'TEXT '),
				expect(promise).to.eventually.have.property('image').that.eql({ small: 'image.jpg:small', medium: 'image.jpg:medium', large: 'image.jpg:large' })
			]);
		});

		it('should reference images', function() {
			default_statuses_show.text = 'TEXT https://t.co/MjJ8xAnT';
			default_statuses_show.entities = { media: [{ media_url_https: 'image_1.jpg', url: 'https://t.co/MjJ8xAnT', type: 'photo' }] };
			default_statuses_show.extended_entities = { media: [{ media_url_https: 'image_1.jpg', url: 'https://t.co/MjJ8xAnT', type: 'photo' }, { media_url_https: 'image_2.jpg', url: 'https://t.co/MjJ8xAnT', type: 'photo' }] };
			statuses_show_endpoint.reply(200, default_statuses_show);

			var promise = twitter.content({ id: 'CONTENT_ID' });

			return Promise.all([
				expect(promise).to.eventually.have.property('text', 'TEXT '),
				expect(promise).to.eventually.not.have.property('image'),
				expect(promise).to.eventually.have.property('images').that.eql([{ small: 'image_1.jpg:small', medium: 'image_1.jpg:medium', large: 'image_1.jpg:large' }, { small: 'image_2.jpg:small', medium: 'image_2.jpg:medium', large: 'image_2.jpg:large' }])
			]);
		});

		it('should reference gif', function() {
			default_statuses_show.text = 'TEXT https://t.co/MjJ8xAnT';
			default_statuses_show.entities = { media: [{ media_url_https: 'image.jpg', url: 'https://t.co/MjJ8xAnT', type: 'photo' }] };
			default_statuses_show.extended_entities = { media: [{ media_url_https: 'image.jpg', url: 'https://t.co/MjJ8xAnT', type: 'animated_gif', video_info: { variants: [{ content_type: 'video/mp4', url: 'gif.mp4' }] } }] };
			statuses_show_endpoint.reply(200, default_statuses_show);

			var promise = twitter.content({ id: 'CONTENT_ID' });

			return Promise.all([
				expect(promise).to.eventually.have.property('text', 'TEXT '),
				expect(promise).to.eventually.have.property('image').that.eql({ small: 'image.jpg:small', medium: 'image.jpg:medium', large: 'image.jpg:large' }),
				expect(promise).to.eventually.have.property('gif', 'gif.mp4')
			]);
		});

		it('should reference video', function() {
			default_statuses_show.text = 'TEXT https://t.co/MjJ8xAnT';
			default_statuses_show.entities = { media: [{ media_url_https: 'image.jpg', url: 'https://t.co/MjJ8xAnT', type: 'photo' }] };
			default_statuses_show.extended_entities = { media: [{ media_url_https: 'image.jpg', url: 'https://t.co/MjJ8xAnT', type: 'video', video_info: { variants: [{ content_type: 'video/mp4', url: 'video.mp4' }] } }] };
			statuses_show_endpoint.reply(200, default_statuses_show);

			var promise = twitter.content({ id: 'CONTENT_ID' });

			return Promise.all([
				expect(promise).to.eventually.have.property('text', 'TEXT '),
				expect(promise).to.eventually.have.property('image').that.eql({ small: 'image.jpg:small', medium: 'image.jpg:medium', large: 'image.jpg:large' }),
				expect(promise).to.eventually.have.property('video', 'video.mp4')
			]);
		});

		// https://dev.twitter.com/overview/api/entities-in-twitter-objects#retweets
		describe('on retweets', function() {
			beforeEach(function() {
				default_statuses_show = { created_at: 'Wed Jun 05 20:07:10 +0000 2012', id_str: 'CONTENT_ID', text: 'RT TEXT', retweet_count: 1002, favorite_count: 1001, user: { screen_name: 'ACCOUNT_ID', profile_image_url_https: 'image_normal.png', name: 'NAME' }, retweeted_status: { created_at: 'Wed Jun 05 20:07:10 +0000 2012', id_str: 'CONTENT_ID_1', text: 'TEXT', retweet_count: 1002, favorite_count: 1001, user: { screen_name: 'ACCOUNT_ID_1', profile_image_url_https: 'image_1_normal.png', name: 'NAME 1' } } };
			});

			it('should callback with retweeted tweet', function() {
				statuses_show_endpoint.reply(200, default_statuses_show);

				return expect(twitter.content({ id: 'CONTENT_ID' })).to.eventually.eql({ api: 'twitter', type: 'content', id: 'CONTENT_ID', date: 1338926830000, account: { api: 'twitter', type: 'account', id: 'ACCOUNT_ID', name: 'NAME', image: { small: 'image_bigger.png', large: 'image.png' } }, reposted_content: { api: 'twitter', type: 'content', id: 'CONTENT_ID_1', text: 'TEXT', date: 1338926830000, stats: { likes: 1001, reposts: 1002 }, account: { api: 'twitter', type: 'account', id: 'ACCOUNT_ID_1', name: 'NAME 1', image: { small: 'image_1_bigger.png', large: 'image_1.png' } } } });
			});
		});

		describe('on quotes', function() {
			beforeEach(function() {
				default_statuses_show = { created_at: 'Wed Jun 05 20:07:10 +0000 2012', id_str: 'CONTENT_ID', text: 'TEXT https://t.co/4VL91iY8Dn', retweet_count: 1002, favorite_count: 1001, user: { screen_name: 'ACCOUNT_ID', profile_image_url_https: 'image_normal.png', name: 'NAME' }, quoted_status: { created_at: 'Wed Jun 05 20:07:10 +0000 2012', id_str: 'CONTENT_ID_1', text: 'TEXT 1', retweet_count: 1012, favorite_count: 1011, user: { screen_name: 'ACCOUNT_ID_1', profile_image_url_https: 'image_1_normal.png', name: 'NAME 1' } }, entities: { urls: [{ expanded_url: 'https://twitter.com/ACCOUNT_ID_1/status/CONTENT_ID_1', display_url: 'twitter.com/ACCOUNT_ID_1/status/CONTENT_ID_1', url: 'https://t.co/4VL91iY8Dn' }] } };
			});

			it('should callback with quoted tweet', function() {
				statuses_show_endpoint.reply(200, default_statuses_show);

				return expect(twitter.content({ id: 'CONTENT_ID' })).to.eventually.eql({ api: 'twitter', type: 'content', id: 'CONTENT_ID', text: 'TEXT ', date: 1338926830000, stats: { likes: 1001, reposts: 1002 }, account: { api: 'twitter', type: 'account', id: 'ACCOUNT_ID', name: 'NAME', image: { small: 'image_bigger.png', large: 'image.png' } }, quoted_content: { api: 'twitter', type: 'content', id: 'CONTENT_ID_1', text: 'TEXT 1', date: 1338926830000, stats: { likes: 1011, reposts: 1012 }, account: { api: 'twitter', type: 'account', id: 'ACCOUNT_ID_1', name: 'NAME 1', image: { small: 'image_1_bigger.png', large: 'image_1.png' } } } });
			});
		});

		describe('on replies', function() {
			var statuses_show_reply_endpoint;
			var default_statuses_show_reply;

			beforeEach(function() {
				statuses_show_reply_endpoint = nock('https://api.twitter.com', { reqheaders: { Authorization: /^OAuth.*oauth_consumer_key="TWITTER_CONSUMER_KEY".*oauth_token="APP_TOKEN".*$/ } })
					.get('/1.1/statuses/show/CONTENT_ID_1.json');

				default_statuses_show = { created_at: 'Wed Jun 05 20:07:10 +0000 2012', id_str: 'CONTENT_ID', text: 'TEXT', retweet_count: 1002, favorite_count: 1001, user: { screen_name: 'ACCOUNT_ID', profile_image_url_https: 'image_normal.png', name: 'NAME' }, in_reply_to_status_id_str: 'CONTENT_ID_1', in_reply_to_screen_name: 'ACCOUNT_ID_1' };
				default_statuses_show_reply = { created_at: 'Wed Jun 05 20:07:10 +0000 2012', id_str: 'CONTENT_ID_1', text: 'TEXT 1', retweet_count: 1012, favorite_count: 1011, user: { screen_name: 'ACCOUNT_ID_1', profile_image_url_https: 'image_1_normal.png', name: 'NAME 1' } };
			});

			it('should callback with replied to tweets', function() {
				statuses_show_endpoint.reply(200, default_statuses_show);
				statuses_show_reply_endpoint.reply(200, default_statuses_show_reply);

				return expect(twitter.content({ id: 'CONTENT_ID' })).to.eventually.eql({ api: 'twitter', type: 'content', id: 'CONTENT_ID', text: 'TEXT', date: 1338926830000, stats: { likes: 1001, reposts: 1002 }, account: { api: 'twitter', type: 'account', id: 'ACCOUNT_ID', name: 'NAME', image: { small: 'image_bigger.png', large: 'image.png' } }, replied_to_content: { api: 'twitter', type: 'content', id: 'CONTENT_ID_1', text: 'TEXT 1', date: 1338926830000, stats: { likes: 1011, reposts: 1012 }, account: { api: 'twitter', type: 'account', id: 'ACCOUNT_ID_1', name: 'NAME 1', image: { small: 'image_1_bigger.png', large: 'image_1.png' } } } });
			});

			describe('statuses show timeline endpoint', function() {
				it('should not err on xxx', function() {
					statuses_show_endpoint.reply(200, default_statuses_show);
					statuses_show_reply_endpoint.reply(404, { statusCode: 404, errors: [] });

					return expect(twitter.content({ id: 'CONTENT_ID' })).to.eventually.not.have.property('replied_to_content');
				});
			});
		});

		describe('statuses user timeline endpoint', function() {
			it('should 401 on Unknown Token', function() {
				nock('https://api.twitter.com', { reqheaders: { Authorization: /^OAuth.*oauth_consumer_key="TWITTER_CONSUMER_KEY".*oauth_token="TWITTER_USER".*$/ } })
					.get('/1.1/statuses/show/CONTENT_ID.json')
					.reply(200, default_statuses_show);

				delete secrets.TWITTER_USER;

				return expect(twitter.content({ id: 'CONTENT_ID', user: 'TWITTER_USER' })).to.be.rejected.and.to.eventually.have.property('code', 401);
			});

			it('should 401 on Invalid/Expired Token', function() {
				nock('https://api.twitter.com', { reqheaders: { Authorization: /^OAuth.*oauth_consumer_key="TWITTER_CONSUMER_KEY".*oauth_token="TWITTER_USER".*$/ } })
					.get('/1.1/statuses/show/CONTENT_ID.json')
					.reply(401, { statusCode: 401, errors: [{ code: 89, message: 'Invalid or expired token.' }] });

				return expect(twitter.content({ id: 'CONTENT_ID', user: 'TWITTER_USER' })).to.be.rejected.and.to.eventually.have.property('code', 401);
			});

			it('should 401 on 401 with no code', function() {
				statuses_show_endpoint.reply(401, { statusCode: 401, request: '/1.1/users/show.json', error: 'Not authorized.' });

				return expect(twitter.content({ id: 'CONTENT_ID' })).to.be.rejected.and.to.eventually.have.property('code', 401);
			});

			it('should 403 on 401 with user and no code', function() {
				nock('https://api.twitter.com', { reqheaders: { Authorization: /^OAuth.*oauth_consumer_key="TWITTER_CONSUMER_KEY".*oauth_token="TWITTER_USER".*$/ } })
					.get('/1.1/statuses/show/CONTENT_ID.json')
					.reply(401, { statusCode: 401, request: '/1.1/users/show.json', error: 'Not authorized.' });

				return expect(twitter.content({ id: 'CONTENT_ID', user: 'TWITTER_USER' })).to.be.rejected.and.to.eventually.have.property('code', 403);
			});

			it('should 403 on Protected Account', function() {
				statuses_show_endpoint.reply(403, { statusCode: 403, errors: [{ code: 179, message: 'Sorry, you are not authorized to see this status.' }] });

				return expect(twitter.content({ id: 'CONTENT_ID' })).to.be.rejected.and.to.eventually.have.property('code', 403);
			});

			it('should 404 on 404', function() {
				statuses_show_endpoint.reply(404, { statusCode: 404, errors: [] });

				return expect(twitter.content({ id: 'CONTENT_ID' })).to.be.rejected.and.to.eventually.have.property('code', 404);
			});

			it('should 429 on 429', function() {
				statuses_show_endpoint.reply(429, { statusCode: 429, errors: [] });

				return expect(twitter.content({ id: 'CONTENT_ID' })).to.be.rejected.and.to.eventually.have.property('code', 429);
			});

			it('should 500 on 4xx', function() {
				statuses_show_endpoint.reply(478, { statusCode: 478, errors: [] });

				var promise = twitter.content({ id: 'CONTENT_ID' });

				return Promise.all([
					expect(promise).to.be.rejected.and.to.eventually.have.property('code', 500),
					expect(promise).to.be.rejected.and.to.eventually.have.property('original_code', 478)
				]);
			});

			it('should 502 on 5xx', function() {
				statuses_show_endpoint.reply(578, { statusCode: 578, errors: [] });

				var promise = twitter.content({ id: 'CONTENT_ID' });

				return Promise.all([
					expect(promise).to.be.rejected.and.to.eventually.have.property('code', 502),
					expect(promise).to.be.rejected.and.to.eventually.have.property('original_code', 578)
				]);
			});
		});
	});

	describe('.discussion', function() {
		var search_tweets_endpoint;
		var default_search_tweets;

		// Probably shouldn't do this
		function test_tweet(num, in_reply_to_num) {
			return { created_at: 'Wed Jun 05 20:07:10 +0000 2012', id_str: 'CONTENT_ID_' + num, text: 'TEXT ' + num, retweet_count: (num * 1000) + 2, favorite_count: (num * 1000) + 1, user: { screen_name: 'ACCOUNT_ID_' + num, profile_image_url_https: 'image_' + num + '_normal.png', name: 'NAME ' + num }, in_reply_to_status_id_str: !_.isUndefined(in_reply_to_num) && ('CONTENT_ID_' + in_reply_to_num), in_reply_to_screen_name: !_.isUndefined(in_reply_to_num) && ('ACCOUNT_ID_' + in_reply_to_num) };
		}

		// Probably shouldn't do this
		function test_content(num) {
			return { api: 'twitter', type: 'content', id: 'CONTENT_ID_' + num, text: 'TEXT ' + num, date: 1338926830000, stats: { likes: (num * 1000) + 1, reposts: (num * 1000) + 2 }, account: { api: 'twitter', type: 'account', id: 'ACCOUNT_ID_' + num, name: 'NAME ' + num, image: { small: 'image_' + num + '_bigger.png', large: 'image_' + num + '.png' } } };
		}

		beforeEach(function() {
			search_tweets_endpoint = nock('https://api.twitter.com', { reqheaders: { Authorization: /^OAuth.*oauth_consumer_key="TWITTER_CONSUMER_KEY".*oauth_token="APP_TOKEN".*$/ } })
				.get('/1.1/search/tweets.json')
				.query({ q: 'to:ACCOUNT_ID_0', since_id: 'CONTENT_ID_0', count: 50 });

			default_search_tweets = { statuses: [test_tweet(10, 0), test_tweet(9, 0), test_tweet(8, 0), test_tweet(7, 0), test_tweet(6, 0), test_tweet(5, 0), test_tweet(4, 0), test_tweet(3, 0), test_tweet(2, 0), test_tweet(1, 0)] };
		});

		it('should callback twitter tweets', function() {
			search_tweets_endpoint.reply(200, default_search_tweets);

			return expect(twitter.discussion({ id: 'CONTENT_ID_0', account: { api: 'twitter', type: 'account', id: 'ACCOUNT_ID_0' } }))
				.to.eventually.eql({ api: 'twitter', type: 'discussion', id: 'CONTENT_ID_0', comments: [test_content(10), test_content(9), test_content(8), test_content(7), test_content(6), test_content(5), test_content(4), test_content(3), test_content(2), test_content(1)] });
		});

		it('should ignore tweets that are not replies', function() {
			default_search_tweets.statuses.unshift(test_tweet(11, 0));
			default_search_tweets.statuses[5] = test_tweet(6, 12);
			search_tweets_endpoint.reply(200, default_search_tweets);

			return expect(twitter.discussion({ id: 'CONTENT_ID_0', account: { api: 'twitter', type: 'account', id: 'ACCOUNT_ID_0' } }))
				.to.eventually.eql({ api: 'twitter', type: 'discussion', id: 'CONTENT_ID_0', comments: [test_content(11), test_content(10), test_content(9), test_content(8), test_content(7), test_content(5), test_content(4), test_content(3), test_content(2), test_content(1)] });
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

			it('should callback twitter tweets', function() {
				search_tweets_for_content_endpoint.reply(200, default_search_tweets_for_content);

				return expect(twitter.discussion({ for: { api: 'someapi', type: 'content', id: 'SOME_CONTENT_ID' } }))
					.to.eventually.eql({ api: 'twitter', type: 'discussion', for: { api: 'someapi', type: 'content', id: 'SOME_CONTENT_ID' }, comments: [test_content(10), test_content(9), test_content(8), test_content(7), test_content(6), test_content(5), test_content(4), test_content(3), test_content(2), test_content(1)] });
			});

			it('should callback the original tweet of retweets', function() {
				default_search_tweets_for_content.statuses[9].retweeted_status = test_tweet(11);
				default_search_tweets_for_content.statuses[9].text = 'RT ' + default_search_tweets_for_content.statuses[9].retweeted_status.text;
				default_search_tweets_for_content.statuses[9].retweet_count = default_search_tweets_for_content.statuses[9].retweeted_status.retweet_count;
				default_search_tweets_for_content.statuses[9].favorite_count = default_search_tweets_for_content.statuses[9].retweeted_status.favorite_count;
				search_tweets_for_content_endpoint.reply(200, default_search_tweets_for_content);

				return expect(twitter.discussion({ for: { api: 'someapi', type: 'content', id: 'SOME_CONTENT_ID' } }))
					.to.eventually.eql({ api: 'twitter', type: 'discussion', for: { api: 'someapi', type: 'content', id: 'SOME_CONTENT_ID' }, comments: [test_content(10), test_content(9), test_content(8), test_content(7), test_content(6), test_content(5), test_content(4), test_content(3), test_content(2), test_content(11)] });
			});

			it('should ignore retweets of included tweets', function() {
				default_search_tweets_for_content.statuses[9].retweeted_status = test_tweet(10);
				default_search_tweets_for_content.statuses[9].text = 'RT ' + default_search_tweets_for_content.statuses[9].retweeted_status.text;
				default_search_tweets_for_content.statuses[9].retweet_count = default_search_tweets_for_content.statuses[9].retweeted_status.retweet_count;
				default_search_tweets_for_content.statuses[9].favorite_count = default_search_tweets_for_content.statuses[9].retweeted_status.favorite_count;
				search_tweets_for_content_endpoint.reply(200, default_search_tweets_for_content);

				return expect(twitter.discussion({ for: { api: 'someapi', type: 'content', id: 'SOME_CONTENT_ID' } }))
					.to.eventually.eql({ api: 'twitter', type: 'discussion', for: { api: 'someapi', type: 'content', id: 'SOME_CONTENT_ID' }, comments: [test_content(10), test_content(9), test_content(8), test_content(7), test_content(6), test_content(5), test_content(4), test_content(3), test_content(2)] });
			});
		});

		it('should replace newlines with linebreaks in the text', function() {
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

			var promise = twitter.discussion({ id: 'CONTENT_ID_0', account: { api: 'twitter', type: 'account', id: 'ACCOUNT_ID_0' } });

			return Promise.all([
				expect(promise).to.eventually.have.deep.property('comments[0].text', 'TEXT<br>10'),
				expect(promise).to.eventually.have.deep.property('comments[1].text', 'TEXT<br>9'),
				expect(promise).to.eventually.have.deep.property('comments[2].text', 'TEXT<br>8'),
				expect(promise).to.eventually.have.deep.property('comments[3].text', 'TEXT<br>7'),
				expect(promise).to.eventually.have.deep.property('comments[4].text', 'TEXT<br>6'),
				expect(promise).to.eventually.have.deep.property('comments[5].text', 'TEXT<br>5'),
				expect(promise).to.eventually.have.deep.property('comments[6].text', 'TEXT<br>4'),
				expect(promise).to.eventually.have.deep.property('comments[7].text', 'TEXT<br>3'),
				expect(promise).to.eventually.have.deep.property('comments[8].text', 'TEXT<br>2'),
				expect(promise).to.eventually.have.deep.property('comments[9].text', 'TEXT<br>1')
			]);
		});

		it('should replace hashtags with links in the text', function() {
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

			var promise = twitter.discussion({ id: 'CONTENT_ID_0', account: { api: 'twitter', type: 'account', id: 'ACCOUNT_ID_0' } });

			return Promise.all([
				expect(promise).to.eventually.have.deep.property('comments[0].text', '<a href="https://twitter.com/hashtag/thing" target="_blank" rel="noopener noreferrer">#thing</a>'),
				expect(promise).to.eventually.have.deep.property('comments[1].text', '<a href="https://twitter.com/hashtag/thing1" target="_blank" rel="noopener noreferrer">#thing1</a>'),
				expect(promise).to.eventually.have.deep.property('comments[2].text', '<a href="https://twitter.com/hashtag/thing2" target="_blank" rel="noopener noreferrer">#thing2</a>'),
				expect(promise).to.eventually.have.deep.property('comments[3].text', '<a href="https://twitter.com/hashtag/thing3" target="_blank" rel="noopener noreferrer">#thing3</a>'),
				expect(promise).to.eventually.have.deep.property('comments[4].text', '<a href="https://twitter.com/hashtag/thing4" target="_blank" rel="noopener noreferrer">#thing4</a>'),
				expect(promise).to.eventually.have.deep.property('comments[5].text', '<a href="https://twitter.com/hashtag/thing5" target="_blank" rel="noopener noreferrer">#thing5</a>'),
				expect(promise).to.eventually.have.deep.property('comments[6].text', '<a href="https://twitter.com/hashtag/thing6" target="_blank" rel="noopener noreferrer">#thing6</a>'),
				expect(promise).to.eventually.have.deep.property('comments[7].text', '<a href="https://twitter.com/hashtag/thing7" target="_blank" rel="noopener noreferrer">#thing7</a>'),
				expect(promise).to.eventually.have.deep.property('comments[8].text', '<a href="https://twitter.com/hashtag/thing8" target="_blank" rel="noopener noreferrer">#thing8</a>'),
				expect(promise).to.eventually.have.deep.property('comments[9].text', '<a href="https://twitter.com/hashtag/thing9" target="_blank" rel="noopener noreferrer">#thing9</a>')
			]);
		});

		it('should replace accounts with links in the text', function() {
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

			var promise = twitter.discussion({ id: 'CONTENT_ID_0', account: { api: 'twitter', type: 'account', id: 'ACCOUNT_ID_0' } });

			return Promise.all([
				expect(promise).to.eventually.have.deep.property('comments[0].text', '<a href="https://twitter.com/ACCOUNT_ID_0" target="_blank" rel="noopener noreferrer">@ACCOUNT_ID_0</a>'),
				expect(promise).to.eventually.have.deep.property('comments[1].text', '<a href="https://twitter.com/ACCOUNT_ID_1" target="_blank" rel="noopener noreferrer">@ACCOUNT_ID_1</a>'),
				expect(promise).to.eventually.have.deep.property('comments[2].text', '<a href="https://twitter.com/ACCOUNT_ID_2" target="_blank" rel="noopener noreferrer">@ACCOUNT_ID_2</a>'),
				expect(promise).to.eventually.have.deep.property('comments[3].text', '<a href="https://twitter.com/ACCOUNT_ID_3" target="_blank" rel="noopener noreferrer">@ACCOUNT_ID_3</a>'),
				expect(promise).to.eventually.have.deep.property('comments[4].text', '<a href="https://twitter.com/ACCOUNT_ID_4" target="_blank" rel="noopener noreferrer">@ACCOUNT_ID_4</a>'),
				expect(promise).to.eventually.have.deep.property('comments[5].text', '<a href="https://twitter.com/ACCOUNT_ID_5" target="_blank" rel="noopener noreferrer">@ACCOUNT_ID_5</a>'),
				expect(promise).to.eventually.have.deep.property('comments[6].text', '<a href="https://twitter.com/ACCOUNT_ID_6" target="_blank" rel="noopener noreferrer">@ACCOUNT_ID_6</a>'),
				expect(promise).to.eventually.have.deep.property('comments[7].text', '<a href="https://twitter.com/ACCOUNT_ID_7" target="_blank" rel="noopener noreferrer">@ACCOUNT_ID_7</a>'),
				expect(promise).to.eventually.have.deep.property('comments[8].text', '<a href="https://twitter.com/ACCOUNT_ID_8" target="_blank" rel="noopener noreferrer">@ACCOUNT_ID_8</a>'),
				expect(promise).to.eventually.have.deep.property('comments[9].text', '<a href="https://twitter.com/ACCOUNT_ID_9" target="_blank" rel="noopener noreferrer">@ACCOUNT_ID_9</a>')
			]);
		});

		it('should replace urls with links in the text from entity', function() {
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

			var promise = twitter.discussion({ id: 'CONTENT_ID_0', account: { api: 'twitter', type: 'account', id: 'ACCOUNT_ID_0' } });

			return Promise.all([
				expect(promise).to.eventually.have.deep.property('comments[0].text', '<a href="https://www.hovercards_0.com" target="_blank" rel="noopener noreferrer">hovercards_0.com</a>'),
				expect(promise).to.eventually.have.deep.property('comments[1].text', '<a href="https://www.hovercards_1.com" target="_blank" rel="noopener noreferrer">hovercards_1.com</a>'),
				expect(promise).to.eventually.have.deep.property('comments[2].text', '<a href="https://www.hovercards_2.com" target="_blank" rel="noopener noreferrer">hovercards_2.com</a>'),
				expect(promise).to.eventually.have.deep.property('comments[3].text', '<a href="https://www.hovercards_3.com" target="_blank" rel="noopener noreferrer">hovercards_3.com</a>'),
				expect(promise).to.eventually.have.deep.property('comments[4].text', '<a href="https://www.hovercards_4.com" target="_blank" rel="noopener noreferrer">hovercards_4.com</a>'),
				expect(promise).to.eventually.have.deep.property('comments[5].text', '<a href="https://www.hovercards_5.com" target="_blank" rel="noopener noreferrer">hovercards_5.com</a>'),
				expect(promise).to.eventually.have.deep.property('comments[6].text', '<a href="https://www.hovercards_6.com" target="_blank" rel="noopener noreferrer">hovercards_6.com</a>'),
				expect(promise).to.eventually.have.deep.property('comments[7].text', '<a href="https://www.hovercards_7.com" target="_blank" rel="noopener noreferrer">hovercards_7.com</a>'),
				expect(promise).to.eventually.have.deep.property('comments[8].text', '<a href="https://www.hovercards_8.com" target="_blank" rel="noopener noreferrer">hovercards_8.com</a>'),
				expect(promise).to.eventually.have.deep.property('comments[9].text', '<a href="https://www.hovercards_9.com" target="_blank" rel="noopener noreferrer">hovercards_9.com</a>')
			]);
		});

		it('should reference image', function() {
			default_search_tweets.statuses[0].text = 'TEXT 1 https://t.co/MjJ8xAnT';
			default_search_tweets.statuses[1].text = 'TEXT 2 https://t.co/TnAx8JjM';
			default_search_tweets.statuses[0].entities = { media: [{ media_url_https: 'image_1.jpg', url: 'https://t.co/MjJ8xAnT', type: 'photo' }] };
			default_search_tweets.statuses[1].entities = { media: [{ media_url_https: 'image_2.jpg', url: 'https://t.co/TnAx8JjM', type: 'photo' }] };
			default_search_tweets.statuses[0].extended_entities = { media: [{ media_url_https: 'image_1.jpg', url: 'https://t.co/MjJ8xAnT', type: 'photo' }] };
			default_search_tweets.statuses[1].extended_entities = { media: [{ media_url_https: 'image_2.jpg', url: 'https://t.co/TnAx8JjM', type: 'photo' }] };
			search_tweets_endpoint.reply(200, default_search_tweets);

			var promise = twitter.discussion({ id: 'CONTENT_ID_0', account: { api: 'twitter', type: 'account', id: 'ACCOUNT_ID_0' } });

			return Promise.all([
				expect(promise).to.eventually.have.deep.property('comments[0].text', 'TEXT 1 '),
				expect(promise).to.eventually.have.deep.property('comments[0].image').that.eql({ small: 'image_1.jpg:small', medium: 'image_1.jpg:medium', large: 'image_1.jpg:large' }),
				expect(promise).to.eventually.have.deep.property('comments[1].text', 'TEXT 2 '),
				expect(promise).to.eventually.have.deep.property('comments[1].image').that.eql({ small: 'image_2.jpg:small', medium: 'image_2.jpg:medium', large: 'image_2.jpg:large' })
			]);
		});

		it('should reference images', function() {
			default_search_tweets.statuses[0].text = 'TEXT 1 https://t.co/MjJ8xAnT';
			default_search_tweets.statuses[1].text = 'TEXT 2 https://t.co/TnAx8JjM';
			default_search_tweets.statuses[0].entities = { media: [{ media_url_https: 'image_1_1.jpg', url: 'https://t.co/MjJ8xAnT', type: 'photo' }] };
			default_search_tweets.statuses[1].entities = { media: [{ media_url_https: 'image_2_1.jpg', url: 'https://t.co/TnAx8JjM', type: 'photo' }] };
			default_search_tweets.statuses[0].extended_entities = { media: [{ media_url_https: 'image_1_1.jpg', url: 'https://t.co/MjJ8xAnT', type: 'photo' }, { media_url_https: 'image_1_2.jpg', url: 'https://t.co/MjJ8xAnT', type: 'photo' }] };
			default_search_tweets.statuses[1].extended_entities = { media: [{ media_url_https: 'image_2_1.jpg', url: 'https://t.co/TnAx8JjM', type: 'photo' }, { media_url_https: 'image_2_2.jpg', url: 'https://t.co/TnAx8JjM', type: 'photo' }] };
			search_tweets_endpoint.reply(200, default_search_tweets);

			var promise = twitter.discussion({ id: 'CONTENT_ID_0', account: { api: 'twitter', type: 'account', id: 'ACCOUNT_ID_0' } });

			return Promise.all([
				expect(promise).to.eventually.have.deep.property('comments[0].text', 'TEXT 1 '),
				expect(promise).to.eventually.not.have.deep.property('comments[0].image'),
				expect(promise).to.eventually.have.deep.property('comments[0].images').that.eql([{ small: 'image_1_1.jpg:small', medium: 'image_1_1.jpg:medium', large: 'image_1_1.jpg:large' }, { small: 'image_1_2.jpg:small', medium: 'image_1_2.jpg:medium', large: 'image_1_2.jpg:large' }]),
				expect(promise).to.eventually.have.deep.property('comments[1].text', 'TEXT 2 '),
				expect(promise).to.eventually.not.have.deep.property('comments[1].image'),
				expect(promise).to.eventually.have.deep.property('comments[1].images').that.eql([{ small: 'image_2_1.jpg:small', medium: 'image_2_1.jpg:medium', large: 'image_2_1.jpg:large' }, { small: 'image_2_2.jpg:small', medium: 'image_2_2.jpg:medium', large: 'image_2_2.jpg:large' }])
			]);
		});

		it('should reference gif', function() {
			default_search_tweets.statuses[0].text = 'TEXT 1 https://t.co/MjJ8xAnT';
			default_search_tweets.statuses[1].text = 'TEXT 2 https://t.co/TnAx8JjM';
			default_search_tweets.statuses[0].entities = { media: [{ media_url_https: 'image_1.jpg', url: 'https://t.co/MjJ8xAnT', type: 'photo' }] };
			default_search_tweets.statuses[1].entities = { media: [{ media_url_https: 'image_2.jpg', url: 'https://t.co/TnAx8JjM', type: 'photo' }] };
			default_search_tweets.statuses[0].extended_entities = { media: [{ media_url_https: 'image_1.jpg', url: 'https://t.co/MjJ8xAnT', type: 'animated_gif', video_info: { variants: [{ content_type: 'video/mp4', url: 'gif_1.mp4' }] } }] };
			default_search_tweets.statuses[1].extended_entities = { media: [{ media_url_https: 'image_2.jpg', url: 'https://t.co/TnAx8JjM', type: 'animated_gif', video_info: { variants: [{ content_type: 'video/mp4', url: 'gif_2.mp4' }] } }] };
			search_tweets_endpoint.reply(200, default_search_tweets);

			var promise = twitter.discussion({ id: 'CONTENT_ID_0', account: { api: 'twitter', type: 'account', id: 'ACCOUNT_ID_0' } });

			return Promise.all([
				expect(promise).to.eventually.have.deep.property('comments[0].text', 'TEXT 1 '),
				expect(promise).to.eventually.have.deep.property('comments[0].image').that.eql({ small: 'image_1.jpg:small', medium: 'image_1.jpg:medium', large: 'image_1.jpg:large' }),
				expect(promise).to.eventually.have.deep.property('comments[0].gif', 'gif_1.mp4'),
				expect(promise).to.eventually.have.deep.property('comments[1].text', 'TEXT 2 '),
				expect(promise).to.eventually.have.deep.property('comments[1].image').that.eql({ small: 'image_2.jpg:small', medium: 'image_2.jpg:medium', large: 'image_2.jpg:large' }),
				expect(promise).to.eventually.have.deep.property('comments[1].gif', 'gif_2.mp4')
			]);
		});

		it('should reference video', function() {
			default_search_tweets.statuses[0].text = 'TEXT 1 https://t.co/MjJ8xAnT';
			default_search_tweets.statuses[1].text = 'TEXT 2 https://t.co/TnAx8JjM';
			default_search_tweets.statuses[0].entities = { media: [{ media_url_https: 'image_1.jpg', url: 'https://t.co/MjJ8xAnT', type: 'photo' }] };
			default_search_tweets.statuses[1].entities = { media: [{ media_url_https: 'image_2.jpg', url: 'https://t.co/TnAx8JjM', type: 'photo' }] };
			default_search_tweets.statuses[0].extended_entities = { media: [{ media_url_https: 'image_1.jpg', url: 'https://t.co/MjJ8xAnT', type: 'video', video_info: { variants: [{ content_type: 'video/mp4', url: 'video_1.mp4' }] } }] };
			default_search_tweets.statuses[1].extended_entities = { media: [{ media_url_https: 'image_2.jpg', url: 'https://t.co/TnAx8JjM', type: 'video', video_info: { variants: [{ content_type: 'video/mp4', url: 'video_2.mp4' }] } }] };
			search_tweets_endpoint.reply(200, default_search_tweets);

			var promise = twitter.discussion({ id: 'CONTENT_ID_0', account: { api: 'twitter', type: 'account', id: 'ACCOUNT_ID_0' } });

			return Promise.all([
				expect(promise).to.eventually.have.deep.property('comments[0].text', 'TEXT 1 '),
				expect(promise).to.eventually.have.deep.property('comments[0].image').that.eql({ small: 'image_1.jpg:small', medium: 'image_1.jpg:medium', large: 'image_1.jpg:large' }),
				expect(promise).to.eventually.have.deep.property('comments[0].video', 'video_1.mp4'),
				expect(promise).to.eventually.have.deep.property('comments[1].text', 'TEXT 2 '),
				expect(promise).to.eventually.have.deep.property('comments[1].image').that.eql({ small: 'image_2.jpg:small', medium: 'image_2.jpg:medium', large: 'image_2.jpg:large' }),
				expect(promise).to.eventually.have.deep.property('comments[1].video', 'video_2.mp4')
			]);
		});

		describe('on retweets', function() {
			it('should callback with retweeted tweets');
		});

		describe('on quotes', function() {
			it('should callback with quoted tweets');
		});

		describe('search tweets endpoint', function() {
			it('should 401 on Unknown Token', function() {
				nock('https://api.twitter.com', { reqheaders: { Authorization: /^OAuth.*oauth_consumer_key="TWITTER_CONSUMER_KEY".*oauth_token="TWITTER_USER".*$/ } })
					.get('/1.1/search/tweets.json')
					.query({ q: 'to:ACCOUNT_ID_0', since_id: 'CONTENT_ID_0', count: 50 })
					.reply(200, default_search_tweets);

				delete secrets.TWITTER_USER;

				return expect(twitter.discussion({ id: 'CONTENT_ID_0', user: 'TWITTER_USER', account: { api: 'twitter', type: 'account', id: 'ACCOUNT_ID_0' } }))
					.to.be.rejected.and.to.eventually.have.property('code', 401);
			});

			it('should 401 on Invalid/Expired Token', function() {
				nock('https://api.twitter.com', { reqheaders: { Authorization: /^OAuth.*oauth_consumer_key="TWITTER_CONSUMER_KEY".*oauth_token="TWITTER_USER".*$/ } })
					.get('/1.1/search/tweets.json')
					.query({ q: 'to:ACCOUNT_ID_0', since_id: 'CONTENT_ID_0', count: 50 })
					.reply(401, { statusCode: 401, errors: [{ code: 89, message: 'Invalid or expired token.' }] });

				return expect(twitter.discussion({ id: 'CONTENT_ID_0', user: 'TWITTER_USER', account: { api: 'twitter', type: 'account', id: 'ACCOUNT_ID_0' } }))
					.to.be.rejected.and.to.eventually.have.property('code', 401);
			});

			it('should 401 on 401 with no code', function() {
				search_tweets_endpoint.reply(401, { statusCode: 401, request: '/1.1/users/show.json', error: 'Not authorized.' });

				return expect(twitter.discussion({ id: 'CONTENT_ID_0', account: { api: 'twitter', type: 'account', id: 'ACCOUNT_ID_0' } }))
					.to.be.rejected.and.to.eventually.have.property('code', 401);
			});

			it('should 403 on 401 with user and no code', function() {
				nock('https://api.twitter.com', { reqheaders: { Authorization: /^OAuth.*oauth_consumer_key="TWITTER_CONSUMER_KEY".*oauth_token="TWITTER_USER".*$/ } })
					.get('/1.1/search/tweets.json')
					.query({ q: 'to:ACCOUNT_ID_0', since_id: 'CONTENT_ID_0', count: 50 })
					.reply(401, { statusCode: 401, request: '/1.1/users/show.json', error: 'Not authorized.' });

				return expect(twitter.discussion({ id: 'CONTENT_ID_0', user: 'TWITTER_USER', account: { api: 'twitter', type: 'account', id: 'ACCOUNT_ID_0' } }))
					.to.be.rejected.and.to.eventually.have.property('code', 403);
			});

			it('should 403 on Protected Account', function() {
				search_tweets_endpoint.reply(403, { statusCode: 403, errors: [{ code: 179, message: 'Sorry, you are not authorized to see this status.' }] });

				return expect(twitter.discussion({ id: 'CONTENT_ID_0', account: { api: 'twitter', type: 'account', id: 'ACCOUNT_ID_0' } }))
					.to.be.rejected.and.to.eventually.have.property('code', 403);
			});

			it('should 404 on 404', function() {
				search_tweets_endpoint.reply(404, { statusCode: 404, errors: [] });

				return expect(twitter.discussion({ id: 'CONTENT_ID_0', account: { api: 'twitter', type: 'account', id: 'ACCOUNT_ID_0' } }))
					.to.be.rejected.and.to.eventually.have.property('code', 404);
			});

			it('should 429 on 429', function() {
				search_tweets_endpoint.reply(429, { statusCode: 429, errors: [] });

				return expect(twitter.discussion({ id: 'CONTENT_ID_0', account: { api: 'twitter', type: 'account', id: 'ACCOUNT_ID_0' } }))
					.to.be.rejected.and.to.eventually.have.property('code', 429);
			});

			it('should 500 on 4xx', function() {
				search_tweets_endpoint.reply(478, { statusCode: 478, errors: [] });

				var promise = twitter.discussion({ id: 'CONTENT_ID_0', account: { api: 'twitter', type: 'account', id: 'ACCOUNT_ID_0' } });

				return Promise.all([
					expect(promise).to.be.rejected.and.to.eventually.have.property('code', 500),
					expect(promise).to.be.rejected.and.to.eventually.have.property('original_code', 478)
				]);
			});

			it('should 502 on 5xx', function() {
				search_tweets_endpoint.reply(578, { statusCode: 578, errors: [] });

				var promise = twitter.discussion({ id: 'CONTENT_ID_0', account: { api: 'twitter', type: 'account', id: 'ACCOUNT_ID_0' } });

				return Promise.all([
					expect(promise).to.be.rejected.and.to.eventually.have.property('code', 502),
					expect(promise).to.be.rejected.and.to.eventually.have.property('original_code', 578)
				]);
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

			default_user_show = { screen_name: 'ACCOUNT_ID', profile_image_url_https: 'image_normal.png', profile_banner_url: 'banner', name: 'NAME', description: 'TEXT', statuses_count: 1000, friends_count: 3000, followers_count: 2000 };
		});

		it('should callback twitter user', function() {
			user_show_endpoint.reply(200, default_user_show);

			return expect(twitter.account({ id: 'ACCOUNT_ID' })).to.eventually.eql({ api: 'twitter', type: 'account', id: 'ACCOUNT_ID', name: 'NAME', text: 'TEXT', image: { small: 'image_bigger.png', large: 'image.png' }, banner: 'banner/1500x500', stats: { content: 1000, followers: 2000, following: 3000 } });
		});

		it('should callback verified', function() {
			default_user_show.verified = true;
			user_show_endpoint.reply(200, default_user_show);

			return expect(twitter.account({ id: 'ACCOUNT_ID' })).to.eventually.have.property('verified').that.is.true;
		});

		it('should reference accounts in text', function() {
			default_user_show.description = 'https://t.co/MjJ8xAnT @ACCOUNT_ID_2';
			default_user_show.entities = { description: { urls: [{ expanded_url: 'https://www.hovercards.com', url: 'https://t.co/MjJ8xAnT' }] } };
			user_show_endpoint.reply(200, default_user_show);

			urls.parse.withArgs('https://www.hovercards.com').returns({ api: 'some_api', type: 'account', id: 'ACCOUNT_ID_1' });
			urls.parse.withArgs('https://twitter.com/ACCOUNT_ID_2').returns({ api: 'twitter', type: 'account', id: 'ACCOUNT_ID_2' });

			var promise = twitter.account({ id: 'ACCOUNT_ID' });

			return Promise.all([
				expect(promise).to.eventually.have.property('accounts').that.contains({ api: 'some_api', type: 'account', id: 'ACCOUNT_ID_1' }),
				expect(promise).to.eventually.have.property('accounts').that.contains({ api: 'twitter', type: 'account', id: 'ACCOUNT_ID_2' })
			]);
		});

		it('should reference account in website', function() {
			default_user_show.url = 'https://t.co/78pYTvWfJd';
			default_user_show.entities = { url: { urls: [{ expanded_url: 'https://www.hovercards.com', url: 'https://t.co/78pYTvWfJd' }] } };
			user_show_endpoint.reply(200, default_user_show);

			urls.parse.withArgs('https://www.hovercards.com').returns({ api: 'some_api', type: 'account', id: 'ACCOUNT_ID_1' });

			return expect(twitter.account({ id: 'ACCOUNT_ID' })).to.eventually.have.property('accounts').that.contains({ api: 'some_api', type: 'account', id: 'ACCOUNT_ID_1' });
		});

		it('should replace hashtags with links in the text', function() {
			default_user_show.description = '#thing #thing2';
			user_show_endpoint.reply(200, default_user_show);

			return expect(twitter.account({ id: 'ACCOUNT_ID' })).to.eventually.have.property('text', '<a href="https://twitter.com/hashtag/thing" target="_blank" rel="noopener noreferrer">#thing</a> <a href="https://twitter.com/hashtag/thing2" target="_blank" rel="noopener noreferrer">#thing2</a>');
		});

		it('should replace accounts with links in the text', function() {
			default_user_show.description = '@ACCOUNT_ID_1 @ACCOUNT_ID_2';
			user_show_endpoint.reply(200, default_user_show);

			return expect(twitter.account({ id: 'ACCOUNT_ID' })).to.eventually.have.property('text', '<a href="https://twitter.com/ACCOUNT_ID_1" target="_blank" rel="noopener noreferrer">@ACCOUNT_ID_1</a> <a href="https://twitter.com/ACCOUNT_ID_2" target="_blank" rel="noopener noreferrer">@ACCOUNT_ID_2</a>');
		});

		it('should remove the default image', function() {
			default_user_show.default_profile_image = true;
			default_user_show.profile_image_url_https = 'https://abs.twimg.com/sticky/default_profile_images/default_profile_0.png';
			user_show_endpoint.reply(200, default_user_show);

			return expect(twitter.account({ id: 'ACCOUNT_ID' })).to.eventually.not.have.property('image');
		});

		it('should replace urls with links in the text from entity', function() {
			default_user_show.description = 'https://t.co/MjJ8xAnT https://t.co/TnAx8JjM';
			default_user_show.entities = { description: { urls: [{ expanded_url: 'https://www.hovercards.com', display_url: 'hovercards.com', url: 'https://t.co/MjJ8xAnT' }, { expanded_url: 'https://www.wenoknow.com', display_url: 'wenoknow.com', url: 'https://t.co/TnAx8JjM' }] } };
			user_show_endpoint.reply(200, default_user_show);

			return expect(twitter.account({ id: 'ACCOUNT_ID' })).to.eventually.have.property('text', '<a href="https://www.hovercards.com" target="_blank" rel="noopener noreferrer">hovercards.com</a> <a href="https://www.wenoknow.com" target="_blank" rel="noopener noreferrer">wenoknow.com</a>');
		});

		describe('user show endpoint', function() {
			it('should 401 on Unknown Token', function() {
				nock('https://api.twitter.com', { reqheaders: { Authorization: /^OAuth.*oauth_consumer_key="TWITTER_CONSUMER_KEY".*oauth_token="TWITTER_USER".*$/ } })
					.get('/1.1/users/show.json')
					.query({ screen_name: 'ACCOUNT_ID' })
					.reply(200, default_user_show);

				delete secrets.TWITTER_USER;

				return expect(twitter.account({ id: 'ACCOUNT_ID', user: 'TWITTER_USER' })).to.be.rejected.and.to.eventually.have.property('code', 401);
			});

			it('should 401 on Invalid/Expired Token', function() {
				nock('https://api.twitter.com', { reqheaders: { Authorization: /^OAuth.*oauth_consumer_key="TWITTER_CONSUMER_KEY".*oauth_token="TWITTER_USER".*$/ } })
					.get('/1.1/users/show.json')
					.query({ screen_name: 'ACCOUNT_ID' })
					.reply(401, { statusCode: 401, errors: [{ code: 89, message: 'Invalid or expired token.' }] });

				return expect(twitter.account({ id: 'ACCOUNT_ID', user: 'TWITTER_USER' })).to.be.rejected.and.to.eventually.have.property('code', 401);
			});

			it('should 401 on 401 with no code', function() {
				user_show_endpoint.reply(401, { statusCode: 401, request: '/1.1/users/show.json', error: 'Not authorized.' });

				return expect(twitter.account({ id: 'ACCOUNT_ID' })).to.be.rejected.and.to.eventually.have.property('code', 401);
			});

			it('should 403 on 401 with user and no code', function() {
				nock('https://api.twitter.com', { reqheaders: { Authorization: /^OAuth.*oauth_consumer_key="TWITTER_CONSUMER_KEY".*oauth_token="TWITTER_USER".*$/ } })
					.get('/1.1/users/show.json')
					.query({ screen_name: 'ACCOUNT_ID' })
					.reply(401, { statusCode: 401, request: '/1.1/users/show.json', error: 'Not authorized.' });

				return expect(twitter.account({ id: 'ACCOUNT_ID', user: 'TWITTER_USER' })).to.be.rejected.and.to.eventually.have.property('code', 403);
			});

			it('should 403 on Protected Account', function() {
				user_show_endpoint.reply(403, { statusCode: 403, errors: [{ code: 179, message: 'Sorry, you are not authorized to see this status.' }] });

				return expect(twitter.account({ id: 'ACCOUNT_ID' })).to.be.rejected.and.to.eventually.have.property('code', 403);
			});

			it('should 404 on 404', function() {
				user_show_endpoint.reply(404, { statusCode: 404, errors: [] });

				return expect(twitter.account({ id: 'ACCOUNT_ID' })).to.be.rejected.and.to.eventually.have.property('code', 404);
			});

			it('should 429 on 429', function() {
				user_show_endpoint.reply(429, { statusCode: 429, errors: [] });

				return expect(twitter.account({ id: 'ACCOUNT_ID' })).to.be.rejected.and.to.eventually.have.property('code', 429);
			});

			it('should 500 on 4xx', function() {
				user_show_endpoint.reply(478, { statusCode: 478, errors: [] });

				var promise = twitter.account({ id: 'ACCOUNT_ID' });

				return Promise.all([
					expect(promise).to.be.rejected.and.to.eventually.have.property('code', 500),
					expect(promise).to.be.rejected.and.to.eventually.have.property('original_code', 478)
				]);
			});

			it('should 502 on 5xx', function() {
				user_show_endpoint.reply(578, { statusCode: 578, errors: [] });

				var promise = twitter.account({ id: 'ACCOUNT_ID' });

				return Promise.all([
					expect(promise).to.be.rejected.and.to.eventually.have.property('code', 502),
					expect(promise).to.be.rejected.and.to.eventually.have.property('original_code', 578)
				]);
			});
		});
	});
});
