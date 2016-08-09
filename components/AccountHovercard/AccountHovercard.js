var React      = require('react');
var classnames = require('classnames');
var connect    = require('react-redux').connect;

var AccountFooter = require('../AccountFooter/AccountFooter');
var AccountHeader = require('../AccountHeader/AccountHeader');
var Collapsable   = require('../Collapsable/Collapsable');
var Err           = require('../Err/Err');
var Loading       = require('../Loading/Loading');
var actions       = require('../../redux/actions');
var browser       = require('../../extension/browser');
var config        = require('../../integrations/config');
var dom           = require('../../utils/dom');
var entityLabel   = require('../../utils/entity-label');
var report        = require('../../report');
var styles        = require('./AccountHovercard.styles.css');
var urls          = require('../../integrations/urls');

module.exports = connect(null, actions)(React.createClass({
	displayName: 'AccountHovercard',
	propTypes:   {
		account:   React.PropTypes.object.isRequired,
		analytics: React.PropTypes.func.isRequired,
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
	onExpandDescription: function() {
		this.props.analytics(['send', 'event', entityLabel(this.props.account, true), 'Expanded description'])
			.catch(report.error);
	},
	render: function() {
		var className = classnames(styles.account, { [styles.noAccountImage]: config.integrations[this.props.account.api].account.noImage }, this.props.className);

		if (this.props.account.err) {
			return <Err className={className} error={this.props.account.err} />;
		}
		if (!this.props.account.loaded) {
			return <Loading className={className} />;
		}

		return (
			<div className={className}>
				<a href={urls.print(this.props.account)} target="_blank">
					<AccountHeader className={styles.header} account={this.props.account} />
					{
						!config.integrations[this.props.account.api].account.noImage &&
						this.props.account.image &&
						<span className={styles.image} style={{ backgroundImage: 'url(' + (this.props.account.image.medium || this.props.account.image.small || this.props.account.image.large) + ')' }} />
					}
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
						<Collapsable className={styles.description} onExpand={this.onExpandDescription} onResize={this.props.onResize}>
							<p className={styles.text} dangerouslySetInnerHTML={{ __html: this.props.account.text }} />
						</Collapsable>
					}
					<AccountFooter className={styles.footer} account={this.props.account} />
				</a>
			</div>
		);
	}
}));
