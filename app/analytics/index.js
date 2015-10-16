var _ = require('underscore');

require('../common/mixins');

module.exports = function() {
	window.top.postMessage({ msg: _.prefix('analytics'), request: _.toArray(arguments) }, '*');
};
