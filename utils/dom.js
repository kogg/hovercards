var _ = require('underscore');

module.exports.hasClass = function(element, classNames) {
	// Based off of jQuery 1.5.0
	return _.every([].concat(classNames), function(className) {
		return ((' ' + element.className + ' ').replace(/[\n\t\r]/g, ' ').indexOf(' ' + className + ' ') > -1);
	});
};

module.exports.addClass = function(element, value) {
	// Based off of jQuery 1.5.0
	if (element.nodeType !== 1) {
		return;
	}
	if (!element.className) {
		element.className = value;
		return;
	}
	var className = ' ' + element.className + ' ';
	var setClass  = element.className;

	(value || '').split(/\s+/).forEach(function(aClassName) {
		if (className.indexOf(' ' + aClassName + ' ') < 0) {
			setClass += ' ' + aClassName;
		}
	});
	element.className = setClass.trim();
};

module.exports.removeClass = function(element, value) {
	// Based off of jQuery 1.5.0
	if (element.nodeType !== 1 || !element.className) {
		return;
	}
	var className = (' ' + element.className + ' ').replace(/[\n\t\r]/g, ' ');

	(value || '').split(/\s+/).forEach(function(aClassName) {
		className = className.replace(' ' + aClassName + ' ', ' ');
	});

	element.className = className.trim();
};

module.exports.massageUrl = function(url) {
	if (!url) {
		return null;
	}
	if (url === '#') {
		return null;
	}
	if (url.match(/^javascript:.*/)) {
		return null;
	}
	var a = document.createElement('a');
	a.href = url;
	url = a.href;
	a.href = '';
	if (a.remove) {
		a.remove();
	}
	if (url === document.URL + '#') {
		return null;
	}
	return url;
};
