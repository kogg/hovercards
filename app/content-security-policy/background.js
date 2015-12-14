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
                  })
                  .value();

chrome.webRequest.onHeadersReceived.addListener(function(details) {
	var csp = _.chain(details)
	           .result('responseHeaders')
	           .findWhere({ name: 'content-security-policy' })
	           .result('value')
	           .value();
	if (!csp) {
		return _.pick(details, 'responseHeaders');
	}
	var csp_object = _.chain(csp.trim().replace(/;$/, '').split(/\s*;\s*/))
	                  .invoke('split', /\s+/)
	                  .indexBy(_.first)
	                  .value();

	_.each(csp_append, function(urls, key) {
		if (csp_object[key]) {
			csp_object[key] = _.union(_.first(csp_object[key], 1), urls, _.rest(csp_object[key]));
		}
	});

	return { responseHeaders: _.chain(details)
	                           .result('responseHeaders')
	                           .unshift({ name: 'content-security-policy', value: _.invoke(csp_object, 'join', ' ').join('; ') + ';' })
	                           .uniq(false, 'name')
	                           .value() };
}, {
	urls:  ['*://*/*'],
	types: ['main_frame', 'sub_frame']
}, ['blocking', 'responseHeaders']);
