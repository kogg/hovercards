var React      = require('react');
var classnames = require('classnames');

var Collapsable = require('../Collapsable/Collapsable');
var styles      = require('./ContentDescription.styles');
var urls        = require('../../integrations/urls');

module.exports = React.createClass({
	displayName: 'ContentDescription',
	propTypes:   {
		className: React.PropTypes.string,
		content:   React.PropTypes.object.isRequired,
		onResize:  React.PropTypes.func.isRequired
	},
	componentDidMount: function() {
		this.props.onResize();
	},
	componentDidUpdate: function(prevProps) {
		if (this.props.content === prevProps.content) {
			return;
		}
		this.props.onResize();
	},
	render: function() {
		return (this.props.content.name || this.props.content.text) ?
			<Collapsable className={classnames(styles.description, this.props.className)} onResize={this.props.onResize}>
				{ this.props.content.name && <a className={styles.name} href={urls.print(this.props.content) || this.props.content.url} target="_blank">{ this.props.content.name }</a> }
				{ this.props.content.text && <p className={styles.text} dangerouslySetInnerHTML={{ __html: this.props.content.text }} /> }
			</Collapsable> :
			null;
	}
});
