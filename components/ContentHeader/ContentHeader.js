var React = require('react');

var browser = require('../../extension/browser');
var styles  = Object.assign({}, require('../flex.styles'), require('./ContentHeader.styles'));
var urls    = require('../../integrations/urls');

module.exports = React.createClass({
	displayName: 'ContentHeader',
	propTypes:   {
		content: React.PropTypes.object.isRequired
	},
	render: function() {
		var accountImage = this.props.content.account && this.props.content.account.image && (this.props.content.account.image.small || this.props.content.account.image.medium || this.props.content.account.image.large);
		var accountName  = (
			(
				this.props.content.account &&
				(
					this.props.content.account.name ||
					browser.i18n.getMessage('account_id_of_' + this.props.content.account.api, [this.props.content.account.id]) ||
					browser.i18n.getMessage('account_id', [this.props.content.account.id])
				)
			) ||
			browser.i18n.getMessage('empty_account_id_of_' + ((this.props.content.account && this.props.content.account.api) || this.props.content.api))
		);

		return (
			<div className={styles.contentHeader}>
				<div className={styles.flexSpread}>
					{accountImage && <a className={styles.image} href={urls.print(this.props.content.account)} target="_blank" style={{ backgroundImage: 'url(' + accountImage + ')' }}></a>}
					<div className={styles.flexGrow}>
						<a className={styles.name} href={urls.print(this.props.content.account)} target="_blank">{accountName}</a>
					</div>
					<a className={styles.shareOnFacebook} href={'https://www.facebook.com/sharer/sharer.php?u=' + urls.print(this.props.content)} target="_blank"></a>
					<a className={styles.shareOnTwitter} href={'https://twitter.com/intent/tweet?url=' + urls.print(this.props.content) + '&via=hovercards&source=https://hovercards.com' /* TODO Use package.json */} target="_blank"></a>
				</div>
			</div>
		);
	}
});
