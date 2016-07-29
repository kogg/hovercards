var _ = require('underscore');

var browser = require('../extension/browser');

var units = ['', 'x-thousand', 'x-million', 'x-billion', 'x-trillion'];

module.exports.number = function(number) {
	if (!_.isNumber(number) || _.isNaN(number)) {
		return number;
	}
	if (number < 10000) {
		return number.toLocaleString();
	}
	var log1000      = Math.floor(Math.log10(number) / 3);
	var multiple1000 = number / Math.pow(1000, log1000);
	var roundto      = Math.pow(10, 2 - Math.floor(Math.log10(multiple1000)));
	multiple1000 = Math.round(multiple1000 * roundto) / roundto;

	if (!log1000) {
		return multiple1000.toLocaleString();
	}
	return browser.i18n.getMessage(units[log1000], [multiple1000.toLocaleString()]);
};
