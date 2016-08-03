var _          = require('underscore');
var React      = require('react');
var classnames = require('classnames');
var connect    = require('react-redux').connect;

var browser     = require('../../extension/browser');
var actions     = require('../../redux/actions.top-frame');
var config      = require('../../integrations/config');
var entityLabel = require('../../utils/entity-label');
var styles      = require('./ContentHeader.styles');
var urls        = require('../../integrations/urls');

module.exports = connect(null, actions)(React.createClass({
	displayName: 'ContentHeader',
	propTypes:   {
		analytics: React.PropTypes.func.isRequired,
		className: React.PropTypes.string,
		content:   React.PropTypes.object.isRequired
	},
	onShare: function(network) {
		this.props.analytics(['send', 'event', entityLabel(this.props.content, true), 'Shared', network]);
	},
	render: function() {
		var accountImage = (
			!config.integrations[this.props.content.api].account.noImage &&
			this.props.content.account &&
			this.props.content.account.image &&
			(
				this.props.content.account.image.small ||
				this.props.content.account.image.medium ||
				this.props.content.account.image.large
			)
		);
		var accountName = (
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
			<div className={classnames(styles.header, this.props.className)}>
				{accountImage && <a className={styles.image} href={urls.print(this.props.content.account)} style={{ backgroundImage: 'url(' + accountImage + ')' }} target="_blank" />}
				<div className={styles.nameContainer}>
					<a className={styles.name} href={urls.print(this.props.content.account)} target="_blank">{accountName}</a>
				</div>
				<a className={styles.shareOnFacebook} href={'https://www.facebook.com/sharer/sharer.php?u=' + urls.print(this.props.content)} target="_blank" onClick={_.partial(this.onShare, 'facebook')} />
				<a className={styles.shareOnTwitter} href={'https://twitter.com/intent/tweet?url=' + urls.print(this.props.content) + '&via=hovercards&source=https://hovercards.com'} target="_blank" onClick={_.partial(this.onShare, 'twitter')} />
			</div>
		);
	}
}));
