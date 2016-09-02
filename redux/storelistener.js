var diff = require('deep-diff');

module.exports = function(store) {
	var state = store.getState();

	console.groupCollapsed('store');
	console.log(state);
	console.groupEnd();
	store.subscribe(function() {
		var newState = store.getState();
		var differences = diff(state, newState);

		if (!differences || !differences.length) {
			return;
		}
		console.groupCollapsed('store change');
		differences.forEach(function(diff) {
			switch (diff.kind) {
				case 'N':
					console.log('["' + diff.path.join('"]["') + '"]', 'to', diff.rhs);
					break;
				case 'D':
					console.log('["' + diff.path.join('"]["') + '"]', 'deleted; was', diff.lhs);
					break;
				case 'E':
					console.log('["' + diff.path.join('"]["') + '"]', 'to', diff.rhs, 'from', diff.lhs);
					break;
				case 'A':
					switch (diff.item.kind) {
						case 'N':
							console.log('["' + diff.path.join('"]["') + '"]', 'added', diff.item.rhs, 'at', diff.index);
							break;
						case 'D':
							console.log('["' + diff.path.join('"]["') + '"]', 'deleted', diff.lhs, 'at', diff.index);
							break;
						case 'E':
							// TODO Finish these cases
							console.log('["' + diff.path.join('"]["') + '"]', diff);
							break;
						case 'A':
							console.log('["' + diff.path.join('"]["') + '"]', diff);
							break;
						default:
							break;
					}
					break;
				default:
					break;
			}
		});
		console.log(newState);
		console.groupEnd();

		state = newState;
	});
};
