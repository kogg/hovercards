var React = require('react');

var AccountDescription = require('../AccountDescription/AccountDescription');
var AccountFooter      = require('../AccountFooter/AccountFooter');
var AccountHeader      = require('../AccountHeader/AccountHeader');

module.exports = React.createClass({
	displayName: 'AccountHovercard',
	render:      function() {
		return (
			<div>
				<AccountHeader />
				<AccountDescription />
				<AccountFooter />
			</div>
		);
	}
});
