var _             = require('underscore');
var createAction  = require('redux-actions').createAction;
var handleActions = require('redux-actions').handleActions;

var browser = require('../extension/browser');
var config  = require('../extension/config');
var report  = require('../report');

module.exports = handleActions(
	{
		SET_OPTION: {
			next: function(state, action) {
				var keys     = action.payload.option.split('.');
				var newState = _.clone(state);
				var obj      = newState;
				for (var i = 0; i < keys.length - 1; i++) {
					if (obj[keys[i]] === undefined) {
						return state;
					}
					obj[keys[i]] = _.clone(obj[keys[i]]);
					obj = obj[keys[i]];
				}
				if (obj === undefined) {
					return state;
				}
				obj[keys[keys.length - 1]] = action.payload.value;
				browser.storage.sync.set({ ['options.' + action.payload.option]: action.payload.value })
					.catch(report.error);
				return newState;
			}
		}
	},
	_.omit(config.options, 'keys')
);

module.exports.attachStore = function(store) {
	browser.storage.sync.get(null).then(function(items) {
		if (items.disabled) {
			// Migrate disabled.API.TYPE to !options.API.TYPE.enabled
			['imgur', 'instagram', 'reddit', 'soundcloud', 'twitter', 'youtube'].forEach(function(integration) {
				if (!items.disabled[integration]) {
					return;
				}
				['content', 'account'].forEach(function(type) {
					if (!items.disabled[integration][type]) {
						return;
					}
					store.dispatch(createAction('SET_OPTION')({ option: [integration, type, 'enabled'].join('.'), value: !items.disabled[integration][type] }));
				});
			});
			browser.storage.sync.remove('disabled')
				.catch(report.error);
		}
		_.pairs(items).forEach(function(entry) {
			var key = entry[0].match(/^options\.(.+)/);
			if (!key) {
				return;
			}
			store.dispatch(createAction('SET_OPTION')({ option: key[1], value: entry[1] }));
		});
	});

	browser.storage.onChanged.addListener(function(changes, areaName) {
		if (areaName !== 'sync') {
			return;
		}
		_.pairs(changes).forEach(function(entry) {
			var key = entry[0].match(/^options\.(.+)/);
			if (!key) {
				return;
			}
			store.dispatch(createAction('SET_OPTION')({ option: key[1], value: entry[1].newValue }));
		});
	});
};
