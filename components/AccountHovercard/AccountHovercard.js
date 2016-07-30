var React      = require('react');
var classnames = require('classnames');

var AccountFooter = require('../AccountFooter/AccountFooter');
var AccountHeader = require('../AccountHeader/AccountHeader');
var browser       = require('../../extension/browser');
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
		if (this.props.account.image) {
			dom.imageLoaded(this.props.account.image.medium || this.props.account.image.small || this.props.account.image.large)
				.then(this.props.onResize);
		}
	},
	componentDidUpdate: function() {
		if (this.props.account.image) {
			dom.imageLoaded(this.props.account.image.medium || this.props.account.image.small || this.props.account.image.large)
				.then(this.props.onResize);
		}
	},
	render: function() {
		return (
			<a className={classnames(styles.account, this.props.className)} href={urls.print(this.props.account)} target="_blank">
				<AccountHeader className={styles.header} account={this.props.account} />
				{this.props.account.image && <span className={styles.image} style={{ backgroundImage: 'url(' + (this.props.account.image.medium || this.props.account.image.small || this.props.account.image.large) + ')' }}></span>}
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
					<div className={styles.description}>
						<p className={styles.text} dangerouslySetInnerHTML={{ __html: this.props.account.text }} />
					</div>
				}
				<AccountFooter account={this.props.account} />
			</a>
		);
	}
});
