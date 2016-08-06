var React      = require('react');
var classnames = require('classnames');
var connect    = require('react-redux').connect;

var actions = require('../../redux/actions');
var browser = require('../../extension/browser');
var styles  = require('./Err.styles');

module.exports = connect(null, actions)(React.createClass({
	displayName: 'Err',
	propTypes:   {
		authenticate: React.PropTypes.func.isRequired,
		className:    React.PropTypes.string,
		error:        React.PropTypes.object.isRequired,
		getEntity:    React.PropTypes.func.isRequired
	},
	onClickCTA: function() {
		return this.props.authenticate({ api: this.props.error.request && this.props.error.request.api })
			.then(function() {
				if (!this.isMounted()) {
					// FIXME Anti-pattern
					return null;
				}
				return this.props.getEntity(this.props.error.request);
			}.bind(this));
	},
	render: function() {
		var integration = this.props.error.request && this.props.error.request.api;
		var cta         = (
			browser.i18n.getMessage('err_' + this.props.error.code + '_cta_of_' + integration) ||
			browser.i18n.getMessage('err_' + this.props.error.code + '_cta')
		);

		return (
			<div className={classnames(styles.error, this.props.className)}>
				<div className={styles.image} />
				<div className={styles.description}>
					<b className={styles.name}>{
						browser.i18n.getMessage('err_' + this.props.error.code + '_name_of_' + integration, [browser.i18n.getMessage('name_of_' + integration)]) ||
						browser.i18n.getMessage('err_' + this.props.error.code + '_name', [browser.i18n.getMessage('name_of_' + integration)])
					}</b>
					<p className={styles.name}>{
						browser.i18n.getMessage('err_' + this.props.error.code + '_text_of_' + integration, [browser.i18n.getMessage('name_of_' + integration)]) ||
						browser.i18n.getMessage('err_' + this.props.error.code + '_text', [browser.i18n.getMessage('name_of_' + integration)])
					}</p>
					{cta && <a className={classnames(styles[integration], styles.cta)} onClick={this.onClickCTA}>{cta}</a>}
				</div>
			</div>
		);
	}
}));
