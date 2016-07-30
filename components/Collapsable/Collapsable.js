var React      = require('react');
var classnames = require('classnames');

var styles = require('./Collapsable.styles');

module.exports = React.createClass({
	displayName: 'Collapsable',
	propTypes:   {
		children:  React.PropTypes.node.isRequired,
		className: React.PropTypes.string,
		onResize:  React.PropTypes.func.isRequired
	},
	getInitialState: function() {
		return { expanded: false, collapsable: true };
	},
	componentDidMount: function() {
		this.props.onResize();
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
	expand: function(event) {
		if (this.state.expanded || !this.state.collapsable) {
			return;
		}
		event.preventDefault();
		this.setState({ expanded: true });
	},
	render: function() {
		return (
			<div className={classnames(styles.collapsable, styles[(this.state.expanded || !this.state.collapsable) ? 'expanded' : 'collapsed'], this.props.className)}
				ref="collapsable"
				onClick={this.expand}>
				{this.props.children}
			</div>
		);
	}
});
