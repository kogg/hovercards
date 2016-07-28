var React = require('react');

var styles             = require('./ContentHovercard.styles');
var ContentDescription = require('../ContentDescription/ContentDescription');
var ContentFooter      = require('../ContentFooter/ContentFooter');
var ContentHeader      = require('../ContentHeader/ContentHeader');
var ContentMedia       = require('../ContentMedia/ContentMedia');
var Discussions        = require('../Discussions/Discussions');

module.exports = React.createClass({
	displayName: 'ContentHovercard',
	propTypes:   {
		content: React.PropTypes.object.isRequired
	},
	render: function() {
		return (
			<div className={styles.content}>
				<ContentHeader content={this.props.content} />
				<ContentDescription />
				<ContentMedia />
				<ContentFooter />
				<Discussions />
			</div>
		);
	}
});
