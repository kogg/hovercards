var _     = require('underscore');
var React = require('react');

var browser = require('../../extension/browser');
var styles  = require('./IntegrationOptions.styles');

var requireLogo = require.context('../../assets/images', false, /-icon-full_color.png$/);

module.exports = React.createClass({
	displayName: 'IntegrationOptions',
	propTypes:   {
		integration: React.PropTypes.string.isRequired,
		setSetting:  React.PropTypes.func.isRequired,
		settings:    React.PropTypes.object.isRequired
	},
	onChange: function(type) {
		this.props.setSetting(this.props.integration + '.' + type + '.enabled', !this.props.settings[type].enabled);
	},
	render: function() {
		return (
			<div className={styles.row}>
				<div className={styles.col6}>
					<label className={styles.setting}>
						<img className={styles.integrationImage} src={requireLogo('./' + this.props.integration + '-icon-full_color.png')} />
						<span className={styles.settingTitle}>{browser.i18n.getMessage('hovercards_of_' + this.props.integration + '_content')}</span>
						<div className={styles.inputContainer}>
							<input type="checkbox" checked={this.props.settings.content.enabled} onChange={_.partial(this.onChange, 'content')} /> {browser.i18n.getMessage('show_these')}
						</div>
					</label>
				</div>
				<div className={styles.col6}>
					<label className={styles.setting}>
						<img className={styles.integrationImage} src={requireLogo('./' + this.props.integration + '-icon-full_color.png')} />
						<span className={styles.settingTitle}>{browser.i18n.getMessage('hovercards_of_account')}</span>
						<div className={styles.inputContainer}>
							<input type="checkbox" checked={this.props.settings.account.enabled} onChange={_.partial(this.onChange, 'account')} /> {browser.i18n.getMessage('show_these')}
						</div>
					</label>
				</div>
			</div>
		);
	}
});
