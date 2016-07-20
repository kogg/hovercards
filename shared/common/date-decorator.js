var _ = require('underscore');

var units = [
	{ copy: 'x-seconds', value: -1 },
	{ copy: 'x-seconds', value: 1000 },
	{ copy: 'x-minutes', value: 1000 * 60 },
	{ copy: 'x-hours', value: 1000 * 60 * 60 },
	{ copy: 'x-days', value: 1000 * 60 * 60 * 24 },
	{ copy: 'x-months', value: 1000 * 60 * 60 * 24 * 31 },
	{ copy: 'x-years', value: 1000 * 60 * 60 * 24 * 31 * 12 }
];

// Display with the proper units, then update when we're going to
// change
module.exports = function(node, date) {
	var copy = this.get('copy') || _.identity;
	if (!_.isNumber(date) || _.isNaN(date)) {
		node.textContent = date;
		return { teardown: _.noop };
	}

	date = new Date(date);
	node.title = date.toString();

	var timeout;
	function display_date_and_set_timeout() {
		var now                = new Date();
		var now_with_date_time = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds()));
		// This difference pretends that months are exactly 31 days.
		var difference = now - now_with_date_time + 1000 * 60 * 60 * 24 * (now.getUTCDate() - date.getUTCDate() + 31 * (now.getUTCMonth() - date.getUTCMonth() + 12 * (now.getUTCFullYear() - date.getUTCFullYear())));
		var unit  = units[_.sortedIndex(units, { value: difference }, 'value') - 1];
		var value = Math.floor(difference / unit.value);

		node.textContent = copy(unit.copy, null, value);
		setTimeout(display_date_and_set_timeout, date + (value + 1) * unit.value - now);
	}
	display_date_and_set_timeout();

	return { teardown: function() { clearTimeout(timeout); } };
};
