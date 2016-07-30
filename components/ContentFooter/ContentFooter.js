var React      = require('react');
var classnames = require('classnames');

var TimeSince = require('../TimeSince/TimeSince');
var browser   = require('../../extension/browser');
var config    = require('../../integrations/config');
var format    = require('../../utils/format');
var styles    = require('../meta.styles');
var urls      = require('../../integrations/urls');

module.exports = React.createClass({
	displayName: 'ContentFooter',
	propTypes:   {
		className: React.PropTypes.string,
		content:   React.PropTypes.object.isRequired
	},
	render: function() {
		return (
			<div className={classnames(styles.meta, this.props.className)}>
				<div className={styles.metaMainContainer}>
					<div className={styles.metaMain}>
						{
							this.props.content.stats && config.integrations[this.props.content.api].content.stats.map(function(stat) {
								if (this.props.content.stats[stat] === undefined) {
									return null;
								}
								var number = stat.match(/_ratio$/) ?
									parseInt(this.props.content.stats[stat] * 100, 10) + '%' :
									format.number(this.props.content.stats[stat]);
								return <span key={stat} className={styles.metaItem}><em title={this.props.content.stats[stat]}>{number}</em> {browser.i18n.getMessage(stat + '_of_' + this.props.content.api) || browser.i18n.getMessage(stat)}</span>;
							}.bind(this))
						}
					</div>
				</div>
				<div>
					{
						this.props.content.date &&
						<a className={styles.metaItem} href={urls.print(this.props.content)} target="_blank" title={this.props.contentdate}>
							<TimeSince date={this.props.content.date} />
						</a>
					}
				</div>
			</div>
		);
	}
});
