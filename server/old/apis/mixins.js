/* eslint-disable */
var _   = require('underscore');
var URI = require('urijs/src/URI');

_.mixin({
	extractURLs: function(string) {
		if (!string) {
			return [];
		}
		var urls = [];
		URI.withinString(string, function(url) { urls.push(url.replace(/">.*$/, '')); return ''; }, { ignoreHtml: true, ignore: /</i });
		return urls;
	},
	urlsToLinks: function(string, replace_function) {
		if (!string) {
			return '';
		}
		return URI.withinString(string, replace_function || function(url) { var uri = URI(url); return '<a href="' + uri.protocol(uri.protocol() || 'https').toString() + '">' + url + '</a>'; }, { ignore: /</i });
	}
});
