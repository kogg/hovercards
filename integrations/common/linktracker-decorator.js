module.exports = function(node) {
	var _     = this.get('_');
	var $     = this.get('$');
	var $node = $(node);

	var click = function(e) {
		if (e.target.tagName.toLowerCase() !== 'a') {
			return;
		}
		this.analytics('send', 'event', 'visited link within comments', 'link clicked', _.analytics_label(this.get('discussion')));
	}.bind(this);

	$node.on('click', click);

	return { teardown: function() {
		$node.off('click', click);
	} };
};
