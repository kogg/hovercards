var _       = require('underscore');
var Ractive = require('ractive');
var config  = require('../config');
var service = require('../service');
var urls    = require('hovercardsshared/urls');
require('../common/mixins');

Ractive.DEBUG = process.env.NODE_ENV !== 'production';

var global_data = {
	_: _,
	prefix: _.prefix,
	copy: function(name, api) {
		var rest = _.rest(arguments, 2);
		name = name.replace(/\-/g, '_');
		return (!_.isEmpty(api) && chrome.i18n.getMessage(api + '_' + name, rest)) || chrome.i18n.getMessage(name, rest);
	},
	url: urls.print
};

var HoverCardRactive = Ractive.extend({
	data:       global_data,
	partials:   _.chain(require('../../node_modules/hovercardsshared/*/@(content|discussion|account|account_content).html', { mode: 'hash' }))
	             .extend(require('../../node_modules/hovercardsshared/@(content|discussion|account|account_content)/layout.html', { mode: 'hash' }))
	             .extend(require('../../node_modules/hovercardsshared/common/*.html', { mode: 'hash' }))
	             .reduce(function(memo, template, key) {
	                 memo[key.replace(/^common\//, '').replace('/', '-')] = template;
	                 return memo;
	             }, {})
	             .value(),
	components: _.chain(require('../../node_modules/hovercardsshared/!(common)/*.ract', { mode: 'hash' }))
	             .extend(require('../../node_modules/hovercardsshared/common/*.ract', { mode: 'hash' }))
	             .reduce(function(memo, obj, key) {
	                 obj.data = _.extend(obj.data || {}, global_data);
	                 memo[key.replace('/', '-')] = Ractive.extend(obj);
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

		service(identity, function(err, data) {
			if (err) {
				return ractive.reset({ expanded: ractive.get('expanded'), loaded: true, err: err });
			}
			switch (data.type) {
				case 'content':
					var given_discussions   = _.each(data.discussions || [], function(discussion) { _.extend(discussion, { loaded: true }); });
					var default_discussions = _.chain(config.apis[data.api])
					                           .result('discussion_apis', [])
					                           .map(function(api) {
					                               return (api === data.api) ? _.defaults({ type: 'discussion' }, data) :
					                                                           { api: api, type: 'discussion', for: _.clone(data) };
					                           })
					                           .value();
					data.discussions = _.chain(given_discussions)
					                    .union(default_discussions)
					                    .uniq(_.property('api'))
					                    .value();
					break;
				case 'account':
					data.content = data.content ? _.extend(data.content, { loaded: true }) :
					                              _.defaults({ type: 'account_content', loaded: false }, data);
					break;
			}
			_.extend(data, { loaded: true, expanded: ractive.get('expanded') });
			ractive.reset(data);

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
						var account_content = ractive.get('content');
						if (account_content.loaded) {
							break;
						}
						service(account_content, function(err, data) {
							if (err) {
								return ractive.set('content', { loaded: true, err: err });
							}
							ractive.set('content', _.extend(data, { loaded: true }));
						});
						break;
				}
			});
		});
	}

	ractive.set('expanded', expanded);

	return ractive;
};
