var React      = require('react');
var classnames = require('classnames');

var ContentDescription = require('../ContentDescription/ContentDescription');
var ContentFooter      = require('../ContentFooter/ContentFooter');
var ContentHeader      = require('../ContentHeader/ContentHeader');
var Discussions        = require('../Discussions/Discussions');
var Err                = require('../Err/Err');
var Loading            = require('../Loading/Loading');
var Media              = require('../Media/Media');
var styles             = require('./ContentHovercard.styles');

module.exports = React.createClass({
	displayName: 'ContentHovercard',
	propTypes:   {
		className: React.PropTypes.string,
		content:   React.PropTypes.object.isRequired,
		hovered:   React.PropTypes.bool.isRequired,
		meta:      React.PropTypes.object.isRequired,
		onResize:  React.PropTypes.func.isRequired
	},
	render: function() {
		var className = classnames(styles.content, this.props.className);

		if (this.props.content.err) {
			return <Err className={className} error={this.props.content.err} />;
		}
		if (!this.props.content.loaded) {
			return <Loading className={className} />;
		}

		return (
			<div className={className}>
				<ContentHeader content={this.props.content} />
				<ContentDescription content={this.props.content} onResize={this.props.onResize} />
				<Media content={this.props.content} hovered={this.props.hovered} meta={this.props.meta} onResize={this.props.onResize} />
				<ContentFooter content={this.props.content} />
				<Discussions content={this.props.content} onResize={this.props.onResize} />
			</div>
		);
	}
});
