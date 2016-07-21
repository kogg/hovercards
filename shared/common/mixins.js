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
	},
	wrapErrorCallback: function(callback, prefix_message) {
		return function(err, result) {
			if (err) {
				err.message = prefix_message + (_.isEmpty(err.message) ? '' : ' - ' + err.message);
				err.status = err.status || 500;
			}
			callback(err, !err && result);
		};
	}
});
