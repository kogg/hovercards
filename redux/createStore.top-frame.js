var createStore = require('./createStore.common');

module.exports = function(initialState) {
	return createStore(
		{
			authentication: require('./authentication.reducer'),
			entities:       require('./entities.reducer'),
			options:        require('./options.reducer')
		},
		initialState
	);
};
