var $ = require('jquery');
var _ = require('underscore');

require('../mixins');

$.analytics = function() {
	window.top.postMessage({ msg: _.prefix('analytics'), request: _.toArray(arguments) }, '*');
};
