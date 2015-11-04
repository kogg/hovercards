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
	copy: function() {
		return chrome.i18n.getMessage((_.first(arguments) || '').replace(/\-/g, '_'), _.rest(arguments));
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
			if (data.content) {
				data.content.loaded = true;
			} else if (data.discussions) {
				data.discussions = _.map(data.discussions, function(discussion) {
					return _.extend(discussion, { loaded: true });
				});
			}
			ractive.reset(_.defaults({ loaded: true }, data));
			resolve(data);
		});
	}));
	obj.data('template-promise').then(null, _.noop);

	if (expanded) {
		if (ractive.get('expanded')) {
			return;
		}
		ractive.set('expanded', true);
		switch (ractive.get('type')) {
			case 'content':
				obj.data('template-promise').then(function(data) {
					var discussion_apis = _.result(config.apis[data.api], 'discussion_apis', []);
					var discussions = ractive.get('discussions');
					ractive.set('discussions', _.map(discussion_apis, function(api) {
						return _.findWhere(discussions, { api: api }) || { api: api };
					}));

					return Promise.all(_.map(discussion_apis, function(api, i) {
						if (ractive.get('discussions.' + i + '.loaded')) {
							return;
						}
						return new Promise(function(resolve, reject) {
							service((api === data.api) ? _.defaults({ type: 'discussion' }, data) :
							                             { api: api, type: 'discussion', for: data },
								function(err, data) {
									if (err) {
										ractive.set('discussions.' + i, { loaded: true, err: err });
										return reject(err);
									}
									ractive.set('discussions.' + i, _.defaults({ loaded: true }, data));
									resolve(data);
								});
						});
					})).then(null, _.noop);
				});
				break;
			case 'account':
				obj.data('template-promise').then(function(data) {
					if (ractive.get('content.loaded')) {
						return;
					}
					ractive.set('content', { loaded: false });

					return new Promise(function(resolve, reject) {
						service(_.defaults({ type: 'account_content' }, data), function(err, data) {
							if (err) {
								ractive.set('content', { loaded: true, err: err });
								return reject(err);
							}
							ractive.set('content', _.defaults({ loaded: true }, data));
							resolve(data);
						});
					}).then(null, _.noop);
				});
				break;
		}
	}

	return ractive;
};
