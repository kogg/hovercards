var _       = require('underscore');
var Ractive = require('ractive');
var config  = require('../config');
var service = require('../service');
var urls    = require('hovercardsshared/urls');
require('../common/mixins');

Ractive.DEBUG = process.env.NODE_ENV !== 'production';

var global_data = {
	_: _,
	copy: function(name, api) {
		var rest = _.rest(arguments, 2);
		name = name.replace(/\-/g, '_');
		return (!_.isEmpty(api) && chrome.i18n.getMessage(api + '_' + name, rest)) || chrome.i18n.getMessage(name, rest);
	},
	number: function(number) {
		if (!_.isNumber(number) || _.isNaN(number)) {
			return number;
		}
		if (number < 10000) {
			return number.toLocaleString();
		}

		var log1000      = Math.floor(Math.log10(number) / 3);
		var multiple1000 = number / Math.pow(1000, log1000);
		var roundto      = Math.pow(10, 2 - Math.floor(Math.log10(multiple1000)));
		multiple1000     = Math.round(multiple1000 * roundto) / roundto;

		if (!log1000) {
			// Shouldn't happen
			return multiple1000.toLocaleString();
		}
		return global_data.copy(['', 'x-thousand', 'x-million', 'x-billion', 'x-trillion'][log1000], null, multiple1000.toLocaleString());
	},
	prefix: _.prefix,
	url: urls.print
};

var HoverCardRactive = Ractive.extend({
	data:       global_data,
	partials:   _.chain(require('../../node_modules/hovercardsshared/*/@(content|discussion|account|account_content).html', { mode: 'hash' }))
	             .extend(require('../../node_modules/hovercardsshared/@(content|discussion|account|account_content)/layout.html', { mode: 'hash' }))
	             .reduce(function(memo, template, key) {
	                 memo[key.replace('/', '-')] = template;
	                 return memo;
	             }, {})
	             .value(),
	components: _.chain(require('../../node_modules/hovercardsshared/*/*.ract', { mode: 'hash' }))
	             .extend(require('../../node_modules/hovercardsshared/common/*.ract', { mode: 'hash' }))
	             .reduce(function(memo, obj, key) {
	                 obj.data = _.extend(obj.data || {}, global_data);
	                 var key_parts = key.split('/');
	                 while (key_parts[0] && _.isEqual(key_parts[0], key_parts[1])) {
	                     key_parts.shift();
	                 }
	                 memo[key_parts.join('-')] = Ractive.extend(obj);
	                 return memo;
	             }, {})
	             .value(),
	decorators:  _.chain(require('../../node_modules/hovercardsshared/common/*-decorator.js', { mode: 'hash' }))
	              .reduce(function(memo, template, key) {
	                  memo[key.replace(/-decorator$/, '')] = template;
	                  return memo;
	              }, {})
	              .value()
});

module.exports = function(obj, identity, expanded) {
	var ractive = obj.data('ractive');

	if (!ractive) {
		ractive = new HoverCardRactive({
			template: '{{>type+"-layout"}}',
			data:     identity,
			el:       obj
		});
		obj.data('ractive', ractive);

		ractive.set(identity.type, { loaded: false });
		service(identity, function(err, data) {
			if (err) {
				return ractive.set(identity.type, { loaded: true, err: err });
			}
			ractive.set(data.type, _.extend(data, { loaded: true }));
			switch (data.type) {
				case 'content':
					var given_discussions   = _.each(data.discussions || [], function(discussion) { _.extend(discussion, { loaded: true }); });
					var default_discussions = _.chain(config.apis[data.api])
					                           .result('discussion_apis', [])
					                           .map(function(api) {
					                               return (api === data.api) ? _.defaults({ type: 'discussion', loaded: false }, data) :
					                                                           { api: api, type: 'discussion', for: _.clone(data) };
					                           })
					                           .value();
					ractive.set('discussions', _.chain(given_discussions)
					                            .union(default_discussions)
					                            .uniq(_.property('api'))
					                            .reject(_.property('hide'))
					                            .value());
					break;
				case 'account':
					ractive.set('account_content', data.content ? _.extend(data.content, { loaded: true }) :
					                                              _.defaults({ type: 'account_content', loaded: false }, data));
					break;
			}

			ractive.observe('expanded', function(expanded, old_expanded) {
				if (!expanded || expanded === old_expanded) {
					return;
				}
				switch (ractive.get('type')) {
					case 'content':
						_.each(ractive.get('discussions'), function(discussion, i) {
							if (discussion.loaded) {
								return;
							}
							service(discussion, function(err, data) {
								if (err) {
									return ractive.set('discussions.' + i, { loaded: true, err: err });
								}
								ractive.set('discussions.' + i, _.extend(data, { loaded: true }));
							});
						});
						break;
					case 'account':
						var account_content = ractive.get('account_content');
						if (account_content.loaded) {
							break;
						}
						service(account_content, function(err, data) {
							if (err) {
								return ractive.set('account_content', { loaded: true, err: err });
							}
							ractive.set('account_content', _.extend(data, { loaded: true }));
						});
						break;
				}
			});
		});
	}

	ractive.set('expanded', expanded);

	return ractive;
};
