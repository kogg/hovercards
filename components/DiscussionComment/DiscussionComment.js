var React      = require('react');
var classnames = require('classnames');

var browser = require('../../extension/browser');
var config  = require('../../integrations/config');
var format  = require('../../utils/format');
var styles  = require('./DiscussionComment.styles.css');
var urls    = require('../../integrations/urls');

var DiscussionComment = module.exports = React.createClass({
	displayName: 'DiscussionComment',
	propTypes:   {
		className:   React.PropTypes.string,
		comment:     React.PropTypes.object.isRequired,
		integration: React.PropTypes.string.isRequired
	},
	render: function() {
		var accountImage = (
			!config.integrations[this.props.integration].account.noImage &&
			this.props.comment.account &&
			this.props.comment.account.image &&
			(
				this.props.comment.account.image.medium ||
				this.props.comment.account.image.large ||
				this.props.comment.account.image.small
			)
		);
		var accountName = (
			(
				this.props.comment.account &&
				(
					this.props.comment.account.name ||
					browser.i18n.getMessage('account_id_of_' + this.props.integration, [this.props.comment.account.id]) ||
					browser.i18n.getMessage('account_id', [this.props.comment.account.id])
				)
			) ||
			browser.i18n.getMessage('empty_account_id_of_' + this.props.integration)
		);

		return (
			<div className={classnames(styles.commentContainer, this.props.className)}>
				<div className={styles.comment}>
					{
						!config.integrations[this.props.integration].account.noImage &&
						<div className={styles.accountImageContainer}>
							<a className={classnames(styles.accountImage, { [styles.empty]: !accountImage })} style={{ backgroundImage: accountImage && ('url(' + accountImage + ')') }} href={urls.print(this.props.comment.account)} />
						</div>
					}
					<div className={styles.description}>
						<a className={styles.accountName} href={urls.print(this.props.comment.account)} target="_blank">{accountName}</a>
						<p className={styles.text} dangerouslySetInnerHTML={{ __html: this.props.comment.text }} />
						{
							config.integrations[this.props.integration].discussion.comments &&
							config.integrations[this.props.integration].discussion.comments.stats &&
							<div>
								{config.integrations[this.props.integration].discussion.comments.stats.map(function(stat) {
									if (this.props.comment.stats[stat] === undefined) {
										return null;
									}
									var number = format.number(this.props.comment.stats[stat]);

									return <span key={stat} className={styles.stat}><em title={this.props.comment.stats[stat].toLocaleString()}>{number}</em> {browser.i18n.getMessage(stat + '_of_' + this.props.integration) || browser.i18n.getMessage(stat)}</span>;
								}.bind(this))}
							</div>
						}
					</div>
				</div>
				{
					this.props.comment.replies &&
					this.props.comment.replies.length &&
					<div className={styles.replies}>
						{this.props.comment.replies && this.props.comment.replies.map(function(reply, i) {
							return <DiscussionComment key={reply.id || i} comment={reply} integration={this.props.integration} />;
						}.bind(this))}
					</div>
				}
			</div>
		);
	}
});
