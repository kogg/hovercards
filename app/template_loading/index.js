var _       = require('underscore');
var Ractive = require('ractive');
var service = require('../service');

Ractive.DEBUG = process.env.NODE_ENV !== 'production';

module.exports = function(obj, identity) {
	return new Ractive({
		el: obj,
		template: '{{#each .}}{{ @key }} {{ . }}<br>{{/each}}',
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
