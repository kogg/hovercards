var _ = require('underscore');

var browser            = require('./browser');
var integrationsConfig = require('../integrations/config');

var csp_append = _.chain(integrationsConfig)
	.result('integrations')
	.pluck('content_security_policy')
	.compact()
	.reduce(function(memo, csp_object) {
		_.each(csp_object, function(urls, key) {
			memo[key] = _.union(memo[key], urls);
		});
		return memo;
	}, {})
	.mapObject(function(urls) {
		return urls.join(' ');
	})
	.value();

csp_append['font-src'] = 'fonts.gstatic.com';

browser.webRequest.onHeadersReceived.addListener(
	function(details) {
		var responseHeaders = _.result(details, 'responseHeaders');
		var csp = _.find(responseHeaders, function(responseHeader) {
			return responseHeader.name.match(/content-security-policy/i);
		});
		if (csp) {
			var csp_object = _.indexBy(csp.value.trim().replace(/;$/, '').split(/\s*;\s*/), function(string) {
				return string.substring(0, string.indexOf(' '));
			});

			_.each(csp_append, function(urls, key) {
				if (csp_object[key]) {
					csp_object[key] += ' ' + urls;
				}
			});

			csp.value = _.values(csp_object).join('; ') + ';';
		}
		return { responseHeaders: responseHeaders };
	},
	{
		urls:  ['*://*/*'],
		types: ['main_frame', 'sub_frame']
	},
	['blocking', 'responseHeaders']
);
