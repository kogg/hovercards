var React = require('react');

var styles = require('./ContentDescription.styles');
var urls   = require('../../integrations/urls');

module.exports = React.createClass({
	displayName: 'ContentDescription',
	propTypes:   {
		content: React.PropTypes.object.isRequired
	},
	render: function() {
		// TODO Collapsing description

		return (this.props.content.name || this.props.content.text) ?
			<div className={styles.contentDescription}>
				{ this.props.content.name && <a className={styles.name} href={urls.print(this.props.content) || this.props.content.url} target="_blank">{ this.props.content.name }</a> }
				{ this.props.content.text && <p className={styles.text} dangerouslySetInnerHTML={{ __html: this.props.content.text }} /> }
			</div> :
			null;
	}
});
