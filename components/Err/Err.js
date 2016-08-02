var React      = require('react');
var classnames = require('classnames');

var browser = require('../../extension/browser');
var styles  = require('./Err.styles');

module.exports = React.createClass({
	displayName: 'Err',
	propTypes:   {
		className: React.PropTypes.string,
		error:     React.PropTypes.object.isRequired
	},
	render: function() {
		var integration = this.props.error.request && this.props.error.request.api;
		var cta         = (
			browser.i18n.getMessage('err_' + this.props.error.status + '_cta_of_' + integration) ||
			browser.i18n.getMessage('err_' + this.props.error.status + '_cta')
		);

		return (
			<div className={classnames(styles.error, this.props.className)}>
				<div className={styles.image} />
				<div className={styles.description}>
					<b className={styles.name}>{
						browser.i18n.getMessage('err_' + this.props.error.status + '_name_of_' + integration, [browser.i18n.getMessage('name_of_' + integration)]) ||
						browser.i18n.getMessage('err_' + this.props.error.status + '_name', [browser.i18n.getMessage('name_of_' + integration)])
					}</b>
					<p className={styles.name}>{
						browser.i18n.getMessage('err_' + this.props.error.status + '_text_of_' + integration, [browser.i18n.getMessage('name_of_' + integration)]) ||
						browser.i18n.getMessage('err_' + this.props.error.status + '_text', [browser.i18n.getMessage('name_of_' + integration)])
					}</p>
					{cta && <a className={classnames(styles[integration], styles.cta)}>{cta}</a>}
				</div>
			</div>
		);
	}
});
