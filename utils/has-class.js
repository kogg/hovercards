module.exports = function(element, className) {
	// Based off of http://james.padolsey.com/jquery/#v=1.5.0&fn=jQuery.fn.hasClass
	return ((' ' + element.className + ' ').replace(/[\n\t\r]/g, ' ').indexOf(' ' + className + ' ') > -1);
};
