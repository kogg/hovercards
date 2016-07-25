var _            = require('underscore');
var handleAction = require('redux-actions').handleAction;

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

// TODO Put this somewhere else
function entity_label(entity) {
	return _.chain([entity.api, entity.type])
		.compact()
		.union(entity.as && ['as', entity.as])
		.union(entity.for ? ['for', entity_label(entity.for)] : [entity.id])
		.join(' ')
		.value();
}
