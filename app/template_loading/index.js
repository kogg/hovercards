var _       = require('underscore');
var Ractive = require('ractive');
var config  = require('../config');
var service = require('../service');
require('../common/mixins');

Ractive.DEBUG = process.env.NODE_ENV !== 'production';

_.extend(Ractive.partials, require('../../node_modules/hovercardsshared/*/@(content|discussion|account|account_content).html', { mode: 'hash' }));

var layouts = {
	content: require('hovercardsshared/content/layout.html'),
	account: require('hovercardsshared/account/layout.html')
};

module.exports = function(obj, identity, expanded) {
	var ractive = obj.data('ractive');
	if (!ractive) {
		ractive = new Ractive({ template: layouts[_.result(identity, 'type')],
		                        data:     _.defaults({ _: _ }, identity),
		                        el:       obj });
		obj.data('ractive', ractive);
	}

	if (!obj.data('start_template_loading')) {
		obj.data('start_template_loading', function() {
			obj.data('start_template_loading', _.noop);
			service(identity, function(err, data) {
				if (err) {
					return ractive.reset({ loaded: true, _: _, err: err });
				}
				ractive.reset(_.defaults({ loaded: true, _: _ }, data));
				obj.data('start_template_loading', function() {
					(obj.data('finish_template_loading') || _.noop)();
				});
				obj.data('start_template_loading')();
			});
		});
	}

	if (expanded && !obj.data('finish_template_loading')) {
		obj.data('finish_template_loading', function() {
			obj.data('finish_template_loading', _.noop);
			var identity = _.pick(ractive.get(), 'api', 'type', 'id', 'as');
			switch (identity.type) {
				case 'content':
					var discussion_apis = _.result(config.apis[identity.api], 'discussion_apis', []);
					ractive.set('discussions', _.map(discussion_apis, function(api) {
						return { api: api };
					}));
					_.each(discussion_apis, function(api, i) {
						service((api === identity.api) ? _.defaults({ type: 'discussion' }, identity) :
						                                 { api: api, type: 'discussion', for: identity },
							function(err, data) {
								if (err) {
									return ractive.set('discussions.' + i, { loaded: true, err: err });
								}
								ractive.set('discussions.' + i, _.defaults({ loaded: true }, data));
							});
					});
					break;
				case 'account':
					ractive.set('content', { loaded: false });
					service(_.defaults({ type: 'account_content' }, identity), function(err, data) {
						if (err) {
							return ractive.set('content', { loaded: true, err: err });
						}
						ractive.set('content', _.defaults({ loaded: true }, data));
					});
					break;
			}
		});
	}

	obj.data('start_template_loading')();

	return ractive;
};
