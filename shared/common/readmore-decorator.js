module.exports = function(node, collapsedClass, expandedClass) {
	var $      = this.get('$');
	var $node  = $(node);

	if (node.scrollHeight <= $node.innerHeight()) {
		return { teardown: function() { } };
	}

	$node.addClass(collapsedClass);

	var click = function() {
		$node
			.off('click', click)
			.removeClass(collapsedClass)
			.addClass(expandedClass);
	};

	$node.on('click', click);

	return { teardown: function() {
		$node.off('click', click);
	} };
};
