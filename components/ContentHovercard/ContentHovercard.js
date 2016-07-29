var React = require('react');

var styles             = require('./ContentHovercard.styles');
var ContentDescription = require('../ContentDescription/ContentDescription');
var ContentFooter      = require('../ContentFooter/ContentFooter');
var ContentHeader      = require('../ContentHeader/ContentHeader');
var Discussions        = require('../Discussions/Discussions');
var Media              = require('../Media/Media');

module.exports = React.createClass({
	displayName: 'ContentHovercard',
	propTypes:   {
		content: React.PropTypes.object.isRequired
	},
	render: function() {
		return (
			<div className={styles.content}>
				<ContentHeader content={this.props.content} />
				<ContentDescription content={this.props.content} />
				<Media content={this.props.content} />
				<ContentFooter content={this.props.content} />
				<Discussions />
			</div>
		);
	}
});
