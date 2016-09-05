var actions     = require('./actions.options');
var createStore = require('./createStore.common');

module.exports = function(initialState) {
	return createStore(
		actions,
		{
			options: require('./options.reducer')
		},
		initialState
	);
};
