var React = require('react');

var styles = require('./Media.styles');

module.exports = React.createClass({
	displayName: 'Media',
	propTypes:   {
		content: React.PropTypes.object.isRequired
	},
	render: function() {
		return (
			<div styles={styles.media}>
			</div>
		);
	}
});
