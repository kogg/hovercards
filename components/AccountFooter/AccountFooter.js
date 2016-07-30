var React      = require('react');
var classnames = require('classnames');

var TimeSince = require('../TimeSince/TimeSince');
var browser   = require('../../extension/browser');
var config    = require('../../integrations/config');
var format    = require('../../utils/format');
var styles    = Object.assign({}, require('../meta.styles'), require('./AccountFooter.styles'));

module.exports = React.createClass({
	displayName: 'AccountFooter',
	propTypes:   {
		account:   React.PropTypes.object.isRequired,
		className: React.PropTypes.string
	},
	render: function() {
		return (
			<div className={classnames(styles.meta, this.props.className)}>
				<div className={styles.metaMainContainer}>
					<div className={styles.metaMain}>
						{
							this.props.account.stats && config.integrations[this.props.account.api].account.stats.map(function(stat) {
								if (stat === 'date') {
									return <span key={stat} className={styles.metaItem}><em><TimeSince date={this.props.account.date} /></em> {browser.i18n.getMessage('age_of_' + this.props.account.api) || browser.i18n.getMessage('age')}</span>;
								}
								if (this.props.account.stats[stat] === undefined) {
									return null;
								}
								return <span key={stat} className={styles.metaItem}><em title={this.props.account.stats[stat].toLocaleString()}>{format.number(this.props.account.stats[stat])}</em> {browser.i18n.getMessage(stat + '_of_' + this.props.account.api) || browser.i18n.getMessage(stat)}</span>;
							}.bind(this))
						}
					</div>
				</div>
				<div>
				</div>
			</div>
		);
	}
});
