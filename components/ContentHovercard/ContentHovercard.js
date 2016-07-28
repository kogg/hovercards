var React = require('react');

var ContentDescription = require('../ContentDescription/ContentDescription');
var ContentFooter      = require('../ContentFooter/ContentFooter');
var ContentHeader      = require('../ContentHeader/ContentHeader');
var ContentMedia       = require('../ContentMedia/ContentMedia');
var Discussions        = require('../Discussions/Discussions');

module.exports = React.createClass({
	displayName: 'ContentHovercard',
	render:      function() {
		return (
			<div>
				<ContentHeader />
				<ContentDescription />
				<ContentMedia />
				<ContentFooter />
				<Discussions />
			</div>
		);
	}
});
