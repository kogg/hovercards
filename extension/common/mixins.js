var _ = require('underscore');

_.mixin({
	analytics_label: function(identity) {
		return _.chain([identity.api, identity.type]) .compact() .union(identity.as && ['as', identity.as]) .union(identity.for && ['for', _.analytics_label(identity.for)]) .value() .join(' ');
	},
	prefix: function(className) {
		return 'HOVERCARDS-' + className;
	},
	scrollbar_width: function() {
		var width;
		var scrollDiv = document.createElement('div');
		scrollDiv.style.width = '100px';
		scrollDiv.style.height = '100px';
		scrollDiv.style.overflow = 'scroll';
		scrollDiv.style.position = 'absolute';
		scrollDiv.style.top = '-9999px';
		document.body.appendChild(scrollDiv);
		width = scrollDiv.offsetWidth - scrollDiv.clientWidth;
		document.body.removeChild(scrollDiv);
		return width;
	}
});
