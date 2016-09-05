var React      = require('react');
var classnames = require('classnames');
var connect    = require('react-redux').connect;

var Collapsable = require('../Collapsable/Collapsable');
var actions     = require('../../redux/actions.top-frame');
var entityLabel = require('../../utils/entity-label');
var report      = require('../../report');
var styles      = require('./ContentDescription.styles');
var urls        = require('../../integrations/urls');

module.exports = connect(null, actions)(React.createClass({
	displayName: 'ContentDescription',
	propTypes:   {
		analytics: React.PropTypes.func.isRequired,
		className: React.PropTypes.string,
		content:   React.PropTypes.object.isRequired,
		onResize:  React.PropTypes.func.isRequired
	},
	componentDidUpdate: function(prevProps) {
		if (this.props.content === prevProps.content) {
			return;
		}
		this.props.onResize();
	},
	onExpandDescription: function() {
		this.props.analytics(['send', 'event', entityLabel(this.props.content, true), 'Expanded description'])
			.catch(report.catchException);
	},
	render: function() {
		return (this.props.content.name || this.props.content.text) ?
			<Collapsable className={classnames(styles.description, this.props.className)} onExpand={this.onExpandDescription} onResize={this.props.onResize}>
				{ this.props.content.name && <a className={styles.name} href={this.props.content.url || urls.print(this.props.content)} target="_blank">{ this.props.content.name }</a> }
				{ this.props.content.text && <p className={styles.text} dangerouslySetInnerHTML={{ __html: this.props.content.text }} /> }
			</Collapsable> :
			null;
	}
}));
