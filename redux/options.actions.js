var _            = require('underscore');
var createAction = require('redux-actions').createAction;

var config = require('../extension/config');

var keys = config.options.keys();

module.exports.setOption = function(request) {
	return function(dispatch) {
		return (_.indexOf(keys, request.option, true) !== -1) && dispatch(createAction('SET_OPTION')(request)) && Promise.resolve();
	};
};
