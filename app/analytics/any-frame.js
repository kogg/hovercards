var $ = require('jquery');
var _ = require('underscore');

require('../common/mixins');

$.analytics = function() {
	window.top.postMessage({ msg: _.prefix('analytics'), request: _.toArray(arguments) }, '*');
};
