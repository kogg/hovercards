var _       = require('underscore');
var Ractive = require('ractive');
var config  = require('../config');
var service = require('../service');
require('../common/mixins');

Ractive.DEBUG = process.env.NODE_ENV !== 'production';

var HoverCardRactive = Ractive.extend({
	data:     { _: _ },
	partials: _.extend({}, require('../../node_modules/hovercardsshared/!(common)/@(content|discussion|account|account_content).html', { mode: 'hash' }),
	                       require('../../node_modules/hovercardsshared/common/*.html', { mode: 'hash' }))
});

var layouts = {
	content: require('hovercardsshared/content/layout.html'),
	account: require('hovercardsshared/account/layout.html')
};

module.exports = function(obj, identity, expanded) {
	var ractive = obj.data('ractive');
	if (!ractive) {
		ractive = new HoverCardRactive({ template: layouts[_.result(identity, 'type')],
		                                 data:     identity,
		                                 el:       obj });
		obj.data('ractive', ractive);
	}

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
		switch (ractive.get('type')) {
			case 'content':
				if (ractive.get('discussions')) {
					return;
				}
				ractive.set('discussions', []);
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
				if (ractive.get('content')) {
					return;
				}
				ractive.set('content', { loaded: false });
				obj.data('template-promise').then(function(data) {
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
