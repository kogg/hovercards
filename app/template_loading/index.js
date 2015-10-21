var _       = require('underscore');
var Ractive = require('ractive');
var service = require('../service');

Ractive.DEBUG = process.env.NODE_ENV !== 'production';

var templates;

module.exports = function(obj, identity) {
	var api  = _.result(identity, 'api');
	var type = _.result(identity, 'type');

	templates = templates || require('../../node_modules/hovercardsshared/*/*.html', { mode: 'hash' });

	return new Ractive({
		el: obj,
		template: templates[api + '/' + type] || 'There is no template for this',
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
