var _            = require('underscore');
var createAction = require('redux-actions').createAction;

var config = require('../extension/config');

var keys = config.options.keys();

var setAuthentication = createAction('SET_AUTHENTICATION');
var setOption         = createAction('SET_OPTION');

module.exports.setOption = function(key, value) {
	return function(dispatch) {
		return (_.indexOf(keys, key, true) !== -1) && dispatch(setOption({ key: key, value: value })) && Promise.resolve();
	};
};

module.exports.setAuthentication = function(request) {
	return function(dispatch) {
		dispatch(setAuthentication(request));
		return Promise.resolve();
	};
};
