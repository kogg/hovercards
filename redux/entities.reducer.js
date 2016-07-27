var _            = require('underscore');
var handleAction = require('redux-actions').handleAction;

var entityLabel = require('../utils/entity-label');

module.exports = handleAction(
	'SET_ENTITY',
	{
		next: function(state, action) {
			return _.defaults({ [entityLabel(action.payload)]: action.payload }, state);
		},
		throw: function(state, action) {
			return _.defaults(
				{
					[entityLabel(action.payload.request)]: _.defaults(
						{ err: _.omit(action.payload, 'request') },
						state[entityLabel(action.payload.request)]
					)
				},
				state
			);
		}
	},
	{}
);
