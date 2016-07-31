var React = require('react');

module.exports = React.createClass({
	displayName: 'Discussion',
	propTypes:   {
		className:  React.PropTypes.string,
		discussion: React.PropTypes.object.isRequired,
		onLoad:     React.PropTypes.func.isRequired
	},
	render: function() {
		return (
			<div className={this.props.className}>{JSON.stringify(this.props.discussion)}</div>
		);
	}
});
