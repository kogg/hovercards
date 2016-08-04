var diff = require('deep-diff');

module.exports = function(store) {
	var state = store.getState();

	console.group('store');
	console.log(state);
	console.groupEnd();
	store.subscribe(function() {
		var newState = store.getState();
		var differences = diff(state, newState);

		if (!differences || !differences.length) {
			return;
		}
		console.group('store change');
		console.log(newState);
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
							console.log('["' + diff.path.join('"]["') + '"]', 'TODO A-E change', diff);
							break;
						case 'A':
							console.log('["' + diff.path.join('"]["') + '"]', 'TODO A-A change', diff);
							break;
						default:
							break;
					}
					break;
				default:
					break;
			}
		});
		console.groupEnd();

		state = newState;
	});
};
