var createStore = require('./createStore.common');

module.exports = function(initialState) {
	return createStore(
		{
			options: require('./options.reducer')
		},
		initialState
	);
};
