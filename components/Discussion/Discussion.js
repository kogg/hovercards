var React      = require('react');
var classnames = require('classnames');

var browser = require('../../extension/browser');
var config  = require('../../integrations/config');
var format  = require('../../utils/format');
var styles  = Object.assign({}, require('../meta.styles'), require('./Discussion.styles.css'));
var urls    = require('../../integrations/urls');

module.exports = React.createClass({
	displayName: 'Discussion',
	propTypes:   {
		className:  React.PropTypes.string,
		discussion: React.PropTypes.object.isRequired,
		onLoad:     React.PropTypes.func.isRequired
	},
	render: function() {
		return (
			<div className={this.props.className}>
				{this.props.discussion.comments && this.props.discussion.comments.map(function(comment, i) {
					var accountImage = (
						!config.integrations[this.props.discussion.api].account.noImage &&
						comment.account && comment.account.image &&
						(
							comment.account.image.medium ||
							comment.account.image.large ||
							comment.account.image.small
						)
					);
					var accountName = (
						(
							comment.account &&
							(
								comment.account.name ||
								browser.i18n.getMessage('account_id_of_' + this.props.discussion.api, [comment.account.id]) ||
								browser.i18n.getMessage('account_id', [comment.account.id])
							)
						) ||
						browser.i18n.getMessage('empty_account_id_of_' + this.props.discussion.api)
					);

					return (
						<div key={comment.id || i}>
							<div className={styles.comment}>
								{
									!config.integrations[this.props.discussion.api].account.noImage &&
									<div className={styles.accountImageContainer}>
										<a className={classnames(styles.accountImage, { [styles.empty]: !accountImage })} style={{ backgroundImage: accountImage && ('url(' + accountImage + ')') }} href={urls.print(comment.account)} />
									</div>
								}
								<div className={styles.description}>
									<a className={styles.accountName} href={urls.print(comment.account)} target="_blank">{accountName}</a>
									<p className={styles.text} dangerouslySetInnerHTML={{ __html: comment.text }} />
									{
										config.integrations[this.props.discussion.api].discussion.comments &&
										config.integrations[this.props.discussion.api].discussion.comments.stats &&
										<div>
											{config.integrations[this.props.discussion.api].discussion.comments.stats.map(function(stat) {
												if (comment.stats[stat] === undefined) {
													return null;
												}
												var number = format.number(comment.stats[stat]);

												return <span key={stat} className={styles.metaItem}><em title={comment.stats[stat].toLocaleString()}>{number}</em> {browser.i18n.getMessage(stat + '_of_' + this.props.discussion.api) || browser.i18n.getMessage(stat)}</span>;
											}.bind(this))}
										</div>
									}
								</div>
							</div>
						</div>
					);
				}.bind(this))}
			</div>
		);
	}
});
