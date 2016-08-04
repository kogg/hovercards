/* eslint-disable no-unused-expressions */
var chai   = require('chai');
var expect = chai.expect;

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
					.to.eql({ api: 'twitter', type: 'content', id: 'CONTENT_ID', account: { api: 'twitter', type: 'account', id: 'ACCOUNT_ID' } });
			});

			it('from twitter.com/ACCOUNT_ID/statuses/CONTENT_ID', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/ACCOUNT_ID/statuses/CONTENT_ID', true, true)))
					.to.eql({ api: 'twitter', type: 'content', id: 'CONTENT_ID', account: { api: 'twitter', type: 'account', id: 'ACCOUNT_ID' } });
			});

			it('from twitter.com/#!/ACCOUNT_ID/status/CONTENT_ID', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/#!/ACCOUNT_ID/status/CONTENT_ID', true, true)))
					.to.eql({ api: 'twitter', type: 'content', id: 'CONTENT_ID', account: { api: 'twitter', type: 'account', id: 'ACCOUNT_ID' } });
			});

			it('from twitter.com/#!/ACCOUNT_ID/statuses/CONTENT_ID', function() {
				expect(urls.parse(url.parse('https://www.twitter.com/#!/ACCOUNT_ID/statuses/CONTENT_ID', true, true)))
					.to.eql({ api: 'twitter', type: 'content', id: 'CONTENT_ID', account: { api: 'twitter', type: 'account', id: 'ACCOUNT_ID' } });
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
