var React = require('react');

var styles = require('./ContentFooter.styles');

module.exports = React.createClass({
	displayName: 'ContentFooter',
	render:      function() {
		return (
			<div className={styles.contentFooter}>
			</div>
		);
	}
});
