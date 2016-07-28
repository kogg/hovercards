var React = require('react');

var urls = require('../../integrations/urls');

var styles = Object.assign({}, require('../flex.styles'), require('./ContentHeader.styles'));

module.exports = React.createClass({
	displayName: 'ContentHeader',
	propTypes:   {
		content: React.PropTypes.object.isRequired
	},
	render: function() {
		var accountImage = this.props.content.account && this.props.content.account.image && (this.props.content.account.image.small || this.props.content.account.image.medium || this.props.content.account.image.large);

		return (
			<div className={styles.contentHeader}>
				<div className={styles.flexSpread}>
					{accountImage && <a className={styles.image} href={urls.print(this.props.content.account)} target="_blank" style={{ backgroundImage: 'url(' + accountImage + ')' }}></a>}
					{
						this.props.content.account &&
						<div className={styles.flexGrow}>
							<a className={styles.name} href={urls.print(this.props.content.account)} target="_blank">{this.props.content.account.name}</a>
						</div>
					}
					<a className={styles.shareOnFacebook} href={'https://www.facebook.com/sharer/sharer.php?u=' + urls.print(this.props.content)} target="_blank"></a>
					<a className={styles.shareOnTwitter} href={'https://twitter.com/intent/tweet?url=' + urls.print(this.props.content) + '&via=hovercards&source=https://hovercards.com' /* TODO Use package.json */} target="_blank"></a>
				</div>
			</div>
		);
	}
});
