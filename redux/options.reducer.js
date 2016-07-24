var _               = require('underscore');
var combineReducers = require('redux').combineReducers;
var handleAction    = require('redux-actions').handleAction;

var browser = require('../extension/browser');
var options = require('../extension/options');

module.exports = function() {
	return (function optionsReducer(object, prefix) {
		prefix = prefix || '';
		return combineReducers(_.mapObject(object, function(value, key) {
			return (_.isObject(value) && !_.isArray(value)) ?
				optionsReducer(value, prefix + key + '.') :
				handleAction('SET_OPTION', optionReducerMap(prefix + key), value);
		}));
	})(_.omit(options, 'keys'));
};

function optionReducerMap(key) {
	return {
		next: function(previousState, action) {
			if (action.payload.key !== key) {
				return previousState;
			}
			browser.storage.sync.set({ ['options.' + key]: action.payload.value });
			return (action.payload.value === undefined) ? null : action.payload.value;
		}
		// FIXME #9
	};
}
