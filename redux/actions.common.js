var _            = require('underscore');
var createAction = require('redux-actions').createAction;

var options = require('../extension/options');

var keys = options.keys();

var setOption = createAction('SET_OPTION');

module.exports.setOption = function(key, value) {
	return function(dispatch) {
		return (_.indexOf(keys, key, true) !== -1) && dispatch(setOption({ key: key, value: value })) && Promise.resolve();
	};
};
