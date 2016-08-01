var _            = require('underscore');
var handleAction = require('redux-actions').handleAction;

var entityLabel = require('../utils/entity-label');

module.exports = handleAction(
	'SET_ENTITY',
	{
		next: function(state, action) {
			return Object.assign({}, state, { [(action.meta || {}).label || entityLabel(action.payload)]: action.payload });
		},
		throw: function(state, action) {
			return Object.assign({}, state, {
				[entityLabel(action.payload.request)]: Object.assign({}, state[entityLabel(action.payload.request)], { err: _.omit(action.payload, 'request') })
			});
		}
	},
	{}
);
