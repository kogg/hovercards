var _      = require('underscore');
var config = require('../config');

var csp_append = _.chain(config)
                  .result('apis')
                  .pluck('content-security-policy')
                  .compact()
                  .reduce(function(memo, csp_object) {
                      _.each(csp_object, function(urls, key) {
                          memo[key] = _.union(memo[key], urls);
                      });
                      return memo;
                  }, {})
                  .mapObject(function(urls) { return urls.join(' '); })
                  .value();

chrome.webRequest.onHeadersReceived.addListener(function(details) {
	var responseHeaders = _.result(details, 'responseHeaders');
	var csp = _.findWhere(responseHeaders, { name: 'content-security-policy' });
	if (csp) {
		var csp_object = _.indexBy(csp.value.trim().replace(/;$/, '').split(/\s*;\s*/), function(string) { return string.substring(0, string.indexOf(' ')); });

		_.each(csp_append, function(urls, key) {
			if (csp_object[key]) {
				csp_object[key] += ' ' + urls;
			}
		});

		csp.value = _.values(csp_object).join('; ') + ';';
	}
	return { responseHeaders: responseHeaders };
}, {
	urls:  ['*://*/*'],
	types: ['main_frame', 'sub_frame']
}, ['blocking', 'responseHeaders']);
