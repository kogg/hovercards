var React = require('react');

var TimeSince = require('../TimeSince/TimeSince');
var browser   = require('../../extension/browser');
var config    = require('../../integrations/config');
var format    = require('../../utils/format');
var styles    = require('./ContentFooter.styles');
var urls      = require('../../integrations/urls');

module.exports = React.createClass({
	displayName: 'ContentFooter',
	propTypes:   {
		content: React.PropTypes.object.isRequired
	},
	render: function() {
		return (
			<div className={styles.contentFooter}>
				<div className={styles.statsContainer}>
					<div className={styles.stats}>
						{this.props.content.stats && config.integrations[this.props.content.api].stats.map(function(stat) {
							if (this.props.content.stats[stat] === undefined) {
								return null;
							}
							var number = stat.match(/_ratio$/) ?
								parseInt(this.props.content.stats[stat] * 100, 10) + '%' :
								format.number(this.props.content.stats[stat]);
							return <span key={stat} className={styles.stat}><em title={this.props.content.stats[stat]}>{number}</em> {browser.i18n.getMessage(stat + '_of_' + this.props.content.api) || browser.i18n.getMessage(stat)}</span>;
						}.bind(this))}
					</div>
				</div>
				<div>
					{ this.props.content.date && <TimeSince href={urls.print(this.props.content)} date={this.props.content.date} /> }
				</div>
			</div>
		);
	}
});
