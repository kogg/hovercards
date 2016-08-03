var React      = require('react');
var classnames = require('classnames');

var styles = require('./Collapsable.styles');

module.exports = React.createClass({
	displayName: 'Collapsable',
	propTypes:   {
		children:  React.PropTypes.node.isRequired,
		className: React.PropTypes.string,
		onExpand:  React.PropTypes.func.isRequired,
		onResize:  React.PropTypes.func.isRequired
	},
	getInitialState: function() {
		return { expanded: false, collapsable: true };
	},
	componentDidMount: function() {
		if (this.refs.collapsable.scrollHeight < this.refs.collapsable.offsetHeight + 5) {
			return this.setState({ collapsable: false });
		}
	},
	componentDidUpdate: function(prevProps, prevState) {
		if (this.state.expanded === prevState.expanded && this.state.collapsable === prevState.collapsable) {
			return;
		}
		this.props.onResize();
	},
	onExpand: function(e) {
		if (this.state.expanded || !this.state.collapsable) {
			return;
		}
		e.preventDefault();
		e.stopPropagation();
		this.setState({ expanded: true });
		this.props.onExpand();
	},
	render: function() {
		return (
			<div ref="collapsable"
				className={classnames(
					styles.collapsable,
					{
						[styles.collapsed]: !this.state.expanded && this.state.collapsable,
						[styles.expanded]:  this.state.expanded || !this.state.collapsable
					},
					this.props.className
				)}
				onClick={this.onExpand}>
				{this.props.children}
			</div>
		);
	}
});
