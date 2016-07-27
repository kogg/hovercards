var React = require('react');

var Hovercard = require('../Hovercard/Hovercard');

module.exports = React.createClass({
	displayName: 'Hovercards',
	render:      function() {
		return (
			<div>
				<Hovercard />
			</div>
		);
	}
});
