var _             = require('underscore');
var handleActions = require('redux-actions').handleActions;

var entityLabel = require('../utils/entity-label');

module.exports = handleActions(
	{
		CLEAR_ENTITIES: {
			next: function(state, action) {
				return _.omit(state, function(value, key) {
					return key.startsWith(action.payload);
				});
			}
		},
		SET_ENTITY: {
			next: function(state, action) {
				return Object.assign({}, state, { [(action.meta || {}).label || entityLabel(action.payload)]: action.payload });
			},
			throw: function(state, action) {
				return Object.assign({}, state, {
					[entityLabel(action.payload.request)]: Object.assign({}, state[entityLabel(action.payload.request)], { err: action.payload })
				});
			}
		}
	},
	{}
);
