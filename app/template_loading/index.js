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
				return ractive.set(identity.type, _.extend(ractive.get(identity.type), { loaded: true, err: err }));
			}
			ractive.set(data.type, _.extend(data, { loaded: true }));
			switch (data.type) {
				case 'content':
					var given_discussions = _.each(data.discussions || [], _.partial(_.extend, _, { loaded: true }));
					delete data.discussions;
					var default_discussions = _.chain(config.apis[data.api])
					                           .result('discussion_apis', [])
					                           .map(function(api) {
					                               return (api === data.api) ? _.defaults({ type: 'discussion', loaded: false }, data) :
					                                                           { api: api, type: 'discussion', for: _.clone(data), loaded: false };
					                           })
					                           .value();
					var discussions = _.chain(given_discussions)
					                   .union(default_discussions)
					                   .uniq(_.property('api'))
					                   .reject(_.property('hide'))
					                   .value();
					ractive.set('discussions', discussions);
					_.each(discussions, function(discussion, i) {
						ractive.observeOnce('expanded && discussion_i === ' + i, function() {
							var discussion = ractive.get('discussions.' + i);
							if (discussion.loaded) {
								return;
							}
							service(discussion, function(err, discussion) {
								if (err) {
									return ractive.set('discussions.' + i, _.extend(ractive.get('discussions.' + i),
									                                                { loaded: true, err: err }));
								}
								ractive.set('discussions.' + i, _.extend(discussion, { loaded: true }));
							});
						});
					});
					ractive.set('discussion_i', 0);
					break;
				case 'account':
					ractive.observeOnce('expanded && account_content', function(account_content) {
						if (account_content.loaded) {
							return;
						}
						service(account_content, function(err, account_content) {
							if (err) {
								return ractive.set('account_content', _.extend(ractive.get('account_content'),
								                                               { loaded: true, err: err }));
							}
							ractive.set('account_content', _.extend(account_content, { loaded: true }));
						});
					});
					ractive.set('account_content', data.content ? _.extend(data.content, { loaded: true }) :
					                                              _.defaults({ type: 'account_content', loaded: false }, data));
					break;
			}
		});
	}

	ractive.set('expanded', expanded);

	return ractive;
};
