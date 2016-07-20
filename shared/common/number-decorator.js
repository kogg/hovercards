var _ = require('underscore');

var units = ['', 'x-thousand', 'x-million', 'x-billion', 'x-trillion'];

// If the number is already going to be 4 digits or less, leave it alone
// Otherwise, make it 3 digits, and with the proper units
module.exports = function(node, number) {
	var copy = this.get('copy') || _.identity;
	if (!_.isNumber(number) || _.isNaN(number)) {
		node.textContent = number;
	} else if (number < 10000) {
		node.textContent = number.toLocaleString();
	} else {
		var log1000      = Math.floor(Math.log10(number) / 3);
		var multiple1000 = number / Math.pow(1000, log1000);
		var roundto      = Math.pow(10, 2 - Math.floor(Math.log10(multiple1000)));
		multiple1000 = Math.round(multiple1000 * roundto) / roundto;

		if (log1000) {
			node.textContent = copy(units[log1000], null, multiple1000.toLocaleString());
			node.title = number.toLocaleString();
		} else {
			// Shouldn't happen
			node.textContent = multiple1000.toLocaleString();
		}
	}
	return { teardown: _.noop };
};
