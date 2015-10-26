var _       = require('underscore');
var Ractive = require('ractive');
var config  = require('../config');
var service = require('../service');
require('../common/mixins');

Ractive.DEBUG = process.env.NODE_ENV !== 'production';

var HoverCardRactive = Ractive.extend({
	data: { _: _ },
	partials: _.reduce(require('../../node_modules/hovercardsshared/*/@(content|discussion|account|account_content|layout).html', { mode: 'hash' }),
		function(memo, template, key) {
			memo[key.replace(/^common\//, '').replace('/', '-')] = template;
			return memo;
		}, {}),
	components: _.reduce(require('../../node_modules/hovercardsshared/*/*.ract', { mode: 'hash' }), function(memo, obj, key) {
		obj.data = _.extend(obj.data || {}, { _: _ });
		memo[key.replace(/^common\//, '').replace('/', '-')] = Ractive.extend(obj);
		return memo;
	}, {})
});

module.exports = function(obj, identity, expanded) {
	obj.data('ractive', obj.data('ractive') || new HoverCardRactive({
		template: '{{>type+"-layout"}}',
		data:     identity,
		el:       obj
	}));
	var ractive = obj.data('ractive');

	obj.data('template-promise', obj.data('template-promise') || new Promise(function(resolve, reject) {
		service(identity, function(err, data) {
			if (err) {
				ractive.reset({ loaded: true, err: err });
				return reject(err);
			}
			ractive.reset(_.defaults({ loaded: true }, data));
			resolve(data);
		});
	}));

	if (expanded) {
		if (ractive.get('expanded')) {
			return;
		}
		ractive.set('expanded', true);
		switch (ractive.get('type')) {
			case 'content':
				obj.data('template-promise').then(function(data) {
					var identity = _.pick(data, 'api', 'type', 'id', 'as');
					var discussion_apis = _.result(config.apis[identity.api], 'discussion_apis', []);
					ractive.set('discussions', _.map(discussion_apis, function(api) { return { api: api }; }));
					return Promise.all(_.map(discussion_apis, function(api, i) {
						return new Promise(function(resolve, reject) {
							service((api === identity.api) ? _.defaults({ type: 'discussion' }, identity) :
							                                 { api: api, type: 'discussion', for: identity },
								function(err, data) {
									if (err) {
										ractive.set('discussions.' + i, { loaded: true, err: err });
										return reject(err);
									}
									ractive.set('discussions.' + i, _.defaults({ loaded: true }, data));
									resolve(data);
								});
						});
					}));
				});
				break;
			case 'account':
				obj.data('template-promise').then(function(data) {
					ractive.set('content', { loaded: false });
					var identity = _.pick(data, 'api', 'type', 'id', 'as');
					return new Promise(function(resolve, reject) {
						service(_.defaults({ type: 'account_content' }, identity), function(err, data) {
							if (err) {
								ractive.set('content', { loaded: true, err: err });
								return reject(err);
							}
							ractive.set('content', _.defaults({ loaded: true }, data));
							resolve(data);
						});
					});
				});
				break;
		}
	}

	return ractive;
};
