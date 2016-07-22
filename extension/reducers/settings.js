var _               = require('underscore');
var combineReducers = require('redux').combineReducers;
var handleAction    = require('redux-actions').handleAction;

var settings = require('../settings');

module.exports = (function settingsReducer(object, prefix) {
	prefix = prefix || '';
	return combineReducers(_.mapObject(object, function(value, key) {
		return (_.isObject(value) && !_.isArray(value)) ?
			settingsReducer(value, prefix + key + '.') :
			handleAction('SET_SETTING', settingReducerMap(prefix + key), value);
	}));
})(_.omit(settings, 'keys'));

function settingReducerMap(key) {
	return {
		next: function(previousState, action) {
			return (action.payload.key === key) ?
				action.payload.value :
				previousState;
		}
		// FIXME #9
	};
}
