var combineReducers = require('redux').combineReducers;

var settingsReducers = require('./settings');

module.exports = combineReducers({
	settings: settingsReducers
});
