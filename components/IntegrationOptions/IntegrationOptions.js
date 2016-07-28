var _     = require('underscore');
var React = require('react');

var browser = require('../../extension/browser');
var styles  = require('./IntegrationOptions.styles');

var requireLogo = require.context('../../assets/images', false, /-icon-full_color.png$/);

module.exports = React.createClass({
	displayName: 'IntegrationOptions',
	propTypes:   {
		integration: React.PropTypes.string.isRequired,
		setOption:   React.PropTypes.func.isRequired,
		options:     React.PropTypes.object.isRequired
	},
	onChange: function(type) {
		this.props.setOption({ option: this.props.integration + '.' + type + '.enabled', value: !this.props.options[type].enabled });
	},
	render: function() {
		return (
			<div className={styles.row}>
				<div className={styles.col6}>
					<label className={styles.option}>
						<img className={styles.integrationImage} src={requireLogo('./' + this.props.integration + '-icon-full_color.png')} />
						<span className={styles.optionTitle}>{browser.i18n.getMessage('hovercards_of_' + this.props.integration + '_content')}</span>
						<div className={styles.inputContainer}>
							<input type="checkbox" checked={this.props.options.content.enabled} onChange={_.partial(this.onChange, 'content')} /> {browser.i18n.getMessage('show_these')}
						</div>
					</label>
				</div>
				<div className={styles.col6}>
					<label className={styles.option}>
						<img className={styles.integrationImage} src={requireLogo('./' + this.props.integration + '-icon-full_color.png')} />
						<span className={styles.optionTitle}>{browser.i18n.getMessage('hovercards_of_account')}</span>
						<div className={styles.inputContainer}>
							<input type="checkbox" checked={this.props.options.account.enabled} onChange={_.partial(this.onChange, 'account')} /> {browser.i18n.getMessage('show_these')}
						</div>
					</label>
				</div>
			</div>
		);
	}
});
