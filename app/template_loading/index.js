var _       = require('underscore');
var Ractive = require('ractive');
var service = require('../service');

Ractive.DEBUG = process.env.NODE_ENV !== 'production';

var templates = {};

module.exports = function(obj, identity) {
	var type = _.result(identity, 'type');

	if (!templates[type]) {
		switch (type) {
			case 'content':
				templates.content = require('hovercardsshared/*/content.html', { mode: 'hash' });
				break;
			case 'discussion':
				templates.discussion = require('hovercardsshared/*/discussion.html', { mode: 'hash' });
				break;
			case 'account':
				templates.account = require('hovercardsshared/*/account.html', { mode: 'hash' });
				break;
			case 'account_content':
				templates.account_content = require('hovercardsshared/*/account_content.html', { mode: 'hash' });
				break;
			default:
				return;
		}
	}

	return new Ractive({
		el: obj,
		template: templates[type][_.result(identity, 'api')] || 'There is no template for this',
		data: function() {
			var instance = this;

			service(identity, function(err, data) {
				instance.set(err ? { loaded: true, err: err } :
				                   _.defaults({ loaded: true }, data));
			});

			return _.defaults({ loaded: false }, identity);
		}
	});
};
