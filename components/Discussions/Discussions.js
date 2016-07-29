var React = require('react');

module.exports = React.createClass({
	displayName: 'Discussions',
	propTypes:   {
		className: React.PropTypes.string
	},
	render: function() {
		return (
			<div className={this.props.className}></div>
		);
	}
});
