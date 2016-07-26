var _            = require('underscore');
var handleAction = require('redux-actions').handleAction;

var entityLabel = require('../utils/entity-label');

module.exports = handleAction(
	'SET_ENTITY',
	{
		next: function(state, action) {
			return _.defaults({ [entityLabel(action.payload)]: action.payload }, state);
		}
		// FIXME #9
	},
	{}
);
