var combineReducers = require('redux').combineReducers;

var optionsReducers = require('./options.reducer');

module.exports = combineReducers({
	options: optionsReducers
});
