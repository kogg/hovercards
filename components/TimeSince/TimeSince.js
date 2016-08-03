var _     = require('underscore');
var React = require('react');

var browser = require('../../extension/browser');

var units = [
	{ copy: 'x_seconds', value: -1 },
	{ copy: 'x_seconds', value: 1000 },
	{ copy: 'x_minutes', value: 1000 * 60 },
	{ copy: 'x_hours', value: 1000 * 60 * 60 },
	{ copy: 'x_days', value: 1000 * 60 * 60 * 24 },
	{ copy: 'x_months', value: 1000 * 60 * 60 * 24 * 31 },
	{ copy: 'x_years', value: 1000 * 60 * 60 * 24 * 31 * 12 }
];

module.exports = React.createClass({
	displayName: 'TimeSince',
	propTypes:   {
		date: React.PropTypes.number.isRequired
	},
	getInitialState: function() {
		return { timesince: '' };
	},
	componentDidMount: function() {
		this.componentWillReceiveProps();
	},
	componentWillReceiveProps: function(nextProps) {
		clearTimeout(this.timeout);
		var date = new Date((nextProps || this.props).date);

		var now                = new Date();
		var now_with_date_time = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds()));
		// This difference pretends that months are exactly 31 days.
		var difference = now - now_with_date_time + 1000 * 60 * 60 * 24 * (now.getUTCDate() - date.getUTCDate() + 31 * (now.getUTCMonth() - date.getUTCMonth() + 12 * (now.getUTCFullYear() - date.getUTCFullYear())));
		var unit  = units[_.sortedIndex(units, { value: difference }, 'value') - 1];
		var value = Math.floor(difference / unit.value);

		this.setState({ timesince: browser.i18n.getMessage(unit.copy, [value]) });
		this.timeout = setTimeout(this.componentWillReceiveProps.bind(this), date + (value + 1) * unit.value - now);
	},
	componentWillUnmount: function() {
		clearTimeout(this.timeout);
	},
	render: function() {
		return <span className={this.props.className} title={(new Date(this.props.date)).toLocaleString()}>{this.state.timesince}</span>;
	}
});
