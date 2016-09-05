var actions     = require('./actions.background');
var createStore = require('./createStore.common');

module.exports = function(initialState) {
	return createStore(
		actions,
		{
			authentication: require('./authentication.reducer'),
			entities:       require('./entities.reducer')
		},
		initialState
	);
};
