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

			var observe_expanded = ractive.observe('expanded', function(expanded, old_expanded) {
				if (!expanded || expanded === old_expanded) {
					return;
				}
				switch (ractive.get('type')) {
					case 'content':
						var started = {};
						ractive.set('discussion_i', 0);
						var observe_discussion_i = ractive.observe('discussion_i', function(i, old_i) {
							if (_.isUndefined(i)  || i === old_i || started[i]) {
								return;
							}
							started[i] = true;
							if (_.size(started) === _.size(ractive.get('discussions'))) {
								observe_discussion_i.cancel();
							}
							var discussion = ractive.get('discussions.' + i);
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
					default:
						return;
				}
				observe_expanded.cancel();
			});
		});
	}

	ractive.set('expanded', expanded);

	return ractive;
};
