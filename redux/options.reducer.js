var _               = require('underscore');
var combineReducers = require('redux').combineReducers;
var handleAction    = require('redux-actions').handleAction;

var browser = require('../extension/browser');
var options = require('../extension/options');

module.exports = (function optionsReducer(object, prefix) {
	prefix = prefix || '';
	return combineReducers(_.mapObject(object, function(value, key) {
		var prefixKey = prefix + key;
		return (_.isObject(value) && !_.isArray(value)) ?
			optionsReducer(value, prefixKey + '.') :
			handleAction(
				'SET_OPTION',
				{
					next: function(state, action) {
						if (action.payload.key !== prefixKey) {
							return state;
						}
						browser.storage.sync.set({ ['options.' + prefixKey]: action.payload.value });
						return (action.payload.value === undefined) ? null : action.payload.value;
					}
					// FIXME #9
				},
				value
			);
	}));
})(_.omit(options, 'keys'));
