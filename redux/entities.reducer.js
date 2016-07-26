var _            = require('underscore');
var handleAction = require('redux-actions').handleAction;

var entity_label = require('../utils/entity-label');

module.exports = handleAction(
	'SET_ENTITY',
	{
		next: function(state, action) {
			return _.defaults({ [entity_label(action.payload)]: action.payload }, state);
		}
		// FIXME #9
	},
	{}
);
