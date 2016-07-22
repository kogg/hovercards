var _            = require('underscore');
var compose      = require('redux').compose;
var createAction = require('redux-actions').createAction;

var browser  = require('./browser');
var settings = require('./settings');

var keys = settings.keys();

var setSetting = createAction('SET_SETTING');

browser.storage.onChanged.addListener(function(changes, areaName) {
	if (areaName !== 'sync') {
		return;
	}
	_.pairs(changes).forEach(function(entry) {
		entry[0] = entry[0].replace(/^settings\./, '');
		if (_.indexOf(keys, entry[0], true) === -1) {
			return;
		}
		setSetting({ key: entry[0], value: entry[1].newValue });
	});
});

module.exports.setSetting = function(key, value) {
	return function(dispatch) {
		if (_.indexOf(keys, key, true) === -1) {
			// FIXME #9
			return Promise.reject();
		}
		return browser.storage.sync.set({ ['settings.' + key]: value })
			.then(
				_.chain(dispatch)
					.compose(setSetting)
					.partial({ key: key, value: value })
					.value()
			)
			.catch(compose(dispatch, setSetting));
	};
};
