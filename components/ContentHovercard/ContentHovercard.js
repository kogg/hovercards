var React = require('react');

var ContentDescription = require('../ContentDescription/ContentDescription');
var ContentFooter      = require('../ContentFooter/ContentFooter');
var ContentHeader      = require('../ContentHeader/ContentHeader');
var Discussions        = require('../Discussions/Discussions');
var Media              = require('../Media/Media');

module.exports = React.createClass({
	displayName: 'ContentHovercard',
	propTypes:   {
		className: React.PropTypes.string,
		content:   React.PropTypes.object.isRequired,
		hovered:   React.PropTypes.bool.isRequired,
		onResize:  React.PropTypes.func.isRequired
	},
	render: function() {
		return (
			<div className={this.props.className}>
				<ContentHeader content={this.props.content} />
				<ContentDescription content={this.props.content} onResize={this.props.onResize} />
				<Media content={this.props.content} hovered={this.props.hovered} onResize={this.props.onResize} />
				<ContentFooter content={this.props.content} />
				<Discussions />
			</div>
		);
	}
});
