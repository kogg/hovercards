var _            = require('underscore');
var createAction = require('redux-actions').createAction;

var config = require('../extension/config');

var keys = config.options.keys();

var clearEntities     = createAction('CLEAR_ENTITIES');
var setAuthentication = createAction('SET_AUTHENTICATION');
var setOption         = createAction('SET_OPTION');

module.exports.clearEntities = function(request) {
	return function(dispatch) {
		dispatch(clearEntities(request));
		return Promise.resolve();
	};
};

module.exports.setOption = function(request) {
	return function(dispatch) {
		return (_.indexOf(keys, request.option, true) !== -1) && dispatch(setOption(request)) && Promise.resolve();
	};
};

module.exports.setAuthentication = function(request) {
	return function(dispatch) {
		dispatch(setAuthentication(request));
		return Promise.resolve();
	};
};
