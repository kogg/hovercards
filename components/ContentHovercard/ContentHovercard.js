var React      = require('react');
var classnames = require('classnames');

var ContentDescription = require('../ContentDescription/ContentDescription');
var ContentFooter      = require('../ContentFooter/ContentFooter');
var ContentHeader      = require('../ContentHeader/ContentHeader');
var Discussions        = require('../Discussions/Discussions');
var Media              = require('../Media/Media');
var styles             = require('./ContentHovercard.styles');

module.exports = React.createClass({
	displayName: 'ContentHovercard',
	propTypes:   {
		className: React.PropTypes.string,
		content:   React.PropTypes.object.isRequired,
		getEntity: React.PropTypes.func.isRequired,
		hovered:   React.PropTypes.bool.isRequired,
		onResize:  React.PropTypes.func.isRequired
	},
	render: function() {
		// TODO #33 Better Loading UI
		var loading = !this.props.content.loaded && !this.props.content.err;

		return (
			<div className={classnames(styles.content, { [styles.loadingContainer]: loading }, this.props.className)}>
				{loading && <div className={styles.loading} /> }
				{!loading && <ContentHeader content={this.props.content} /> }
				{!loading && <ContentDescription content={this.props.content} onResize={this.props.onResize} /> }
				{!loading && <Media content={this.props.content} hovered={this.props.hovered} onResize={this.props.onResize} /> }
				{!loading && <ContentFooter content={this.props.content} /> }
				{!loading && <Discussions content={this.props.content} getEntity={this.props.getEntity} onResize={this.props.onResize} /> }
			</div>
		);
	}
});
