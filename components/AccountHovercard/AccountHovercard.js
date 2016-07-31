var React = require('react');

var AccountFooter = require('../AccountFooter/AccountFooter');
var AccountHeader = require('../AccountHeader/AccountHeader');
var Collapsable   = require('../Collapsable/Collapsable');
var browser       = require('../../extension/browser');
var config        = require('../../integrations/config');
var dom           = require('../../utils/dom');
var styles        = require('./AccountHovercard.styles.css');
var urls          = require('../../integrations/urls');

module.exports = React.createClass({
	displayName: 'AccountHovercard',
	propTypes:   {
		account:   React.PropTypes.object.isRequired,
		className: React.PropTypes.string,
		hovered:   React.PropTypes.bool.isRequired,
		onResize:  React.PropTypes.func.isRequired
	},
	componentDidMount: function() {
		if (!config.integrations[this.props.account.api].account.noImage && this.props.account.image) {
			dom.imageLoaded(this.props.account.image.medium || this.props.account.image.small || this.props.account.image.large)
				.then(this.props.onResize);
		}
	},
	componentDidUpdate: function() {
		if (!config.integrations[this.props.account.api].account.noImage && this.props.account.image) {
			dom.imageLoaded(this.props.account.image.medium || this.props.account.image.small || this.props.account.image.large)
				.then(this.props.onResize);
		}
	},
	render: function() {
		return (
			<a className={this.props.className} href={urls.print(this.props.account)} target="_blank">
				<AccountHeader className={styles.header} account={this.props.account} />
				{!config.integrations[this.props.account.api].account.noImage && this.props.account.image && <span className={styles.image} style={{ backgroundImage: 'url(' + (this.props.account.image.medium || this.props.account.image.small || this.props.account.image.large) + ')' }}></span>}
				<div className={styles.nameContainer}>
					<span className={styles.name}>
						{
							this.props.account.name ||
							browser.i18n.getMessage('account_id_of_' + this.props.account.api, [this.props.account.id]) ||
							browser.i18n.getMessage('account_id', [this.props.account.id]) ||
							browser.i18n.getMessage('empty_account_id_of_' + this.props.account.api)
						}
					</span>
					{this.props.account.verified && <span className={styles.verified} />}
				</div>
				{
					this.props.account.text &&
					<Collapsable className={styles.description} expandable={false} onResize={this.props.onResize}>
						<p className={styles.text} dangerouslySetInnerHTML={{ __html: this.props.account.text }} />
					</Collapsable>
				}
				<AccountFooter className={styles.footer} account={this.props.account} />
			</a>
		);
	}
});
