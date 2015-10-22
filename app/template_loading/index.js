var _       = require('underscore');
var Ractive = require('ractive');
var service = require('../service');
require('../common/mixins');

Ractive.DEBUG = process.env.NODE_ENV !== 'production';

_.extend(Ractive.partials, require('../../node_modules/hovercardsshared/*/content.html',         { mode: 'hash' }),
                           require('../../node_modules/hovercardsshared/*/discussion.html',      { mode: 'hash' }),
                           require('../../node_modules/hovercardsshared/*/account.html',         { mode: 'hash' }),
                           require('../../node_modules/hovercardsshared/*/account_content.html', { mode: 'hash' }));

var layouts = require('../../node_modules/hovercardsshared/*/layout.html', { mode: 'hash' });

module.exports = function(obj, identity, expanded) {
	var ractive = new Ractive({ template: layouts[_.result(identity, 'type') + '/layout'],
	                            data:     _.defaults({ loaded: false, _: _ }, identity),
	                            el:       obj });

	if (!obj.data('start_template_loading')) {
		obj.data('start_template_loading', function() {
			obj.data('start_template_loading', _.noop);
			service(identity, function(err, data) {
				if (err) {
					return ractive.set({ loaded: true, err: err });
				}
				ractive.set(_.defaults({ loaded: true }, data));
				obj.data('start_template_loading', function() {
					(obj.data('finish_template_loading') || _.noop)();
				});
			});
		});
	}

	if (expanded && !obj.data('finish_template_loading')) {
		obj.data('finish_template_loading', function() {
			obj.data('finish_template_loading', _.noop);
			var identity = _.pick(ractive.get(), 'api', 'type', 'id', 'as');
			switch (identity.type) {
				case 'content':
					var discussion_apis = _.result(require('hovercardsshared/config').apis[identity.api], 'discussion_apis', []);
					ractive.set('discussions', _.map(discussion_apis, function(api, i) {
						service((api === identity.api) ? _.defaults({ type: 'discussion' }, identity) :
						                                 { api: api, type: 'discussion', for: identity },
							function(err, data) {
								if (err) {
									return ractive.set('discussions.' + i, { loaded: true, err: err });
								}
								ractive.set('discussions.' + i, _.defaults({ loaded: true }, data));
							});
						return { loaded: false };
					}));
					break;
				case 'account':
					ractive.set('content.loaded', false);
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
