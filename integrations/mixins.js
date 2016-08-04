var _ = require('underscore');

_.mixin({
	somePredicate: function() {
		var predicates = arguments;
		return function() {
			var args = arguments;
			return _.some(predicates, function(predicate) {
				return predicate.apply(_, args);
			});
		};
	}
});
