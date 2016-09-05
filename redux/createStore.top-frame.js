var actions     = require('./actions.top-frame');
var createStore = require('./createStore.common');

module.exports = function(initialState) {
	return createStore(
		actions,
		{
			authentication: require('./authentication.reducer'),
			entities:       require('./entities.reducer'),
			options:        require('./options.reducer')
		},
		initialState
	);
};
