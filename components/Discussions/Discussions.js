var _          = require('underscore');
var React      = require('react');
var classnames = require('classnames');
var connect    = require('react-redux').connect;

var Discussion  = require('../Discussion/Discussion');
var browser     = require('../../extension/browser');
var config      = require('../../integrations/config');
var entityLabel = require('../../utils/entity-label');
var styles      = require('./Discussions.styles');

module.exports = connect(
	function(state, ownProps) {
		// TODO Gross
		return {
			discussions: config.integrations[ownProps.content.api].discussion.integrations.map(function(integration) {
				var request = discussionRequest(ownProps.content, integration);

				// FIXME On chance, it's doing "reddit discussion ";

				return state.entities[entityLabel(request)] || request;
			})
		};
	}
)(React.createClass({
	displayName: 'Discussions',
	propTypes:   {
		className:   React.PropTypes.string,
		content:     React.PropTypes.object.isRequired,
		discussions: React.PropTypes.array.isRequired,
		getEntity:   React.PropTypes.func.isRequired,
		onResize:    React.PropTypes.func.isRequired
	},
	getInitialState: function() {
		return { selected: 0 };
	},
	componentDidMount: function() {
		for (var selected = 0; selected < this.props.discussions.length; selected++) {
			var discussion = this.props.discussions[selected];

			if (!discussion.loaded || (discussion.comments && discussion.comments.length)) {
				return this.select(selected);
			}
		}
		this.select(0, true);
	},
	componentDidUpdate: function() {
		var discussion = this.props.discussions[this.state.selected];

		if (this.state.dontRotate || !discussion.loaded || (discussion.comments && discussion.comments.length)) {
			return;
		}
		if (this.state.selected === this.props.discussions.length - 1) {
			this.select(0, true);
			return;
		}
		this.select(this.state.selected + 1);
	},
	select: function(i, event) {
		this.setState({ selected: i, dontRotate: this.state.dontRotate || Boolean(event) });
		this.props.getEntity(this.props.discussions[i]);
	},
	render: function() {
		return (
			<div className={classnames(styles.discussionsContainer, this.props.className)}>
				<div className={styles.discussions}>
					<div className={styles.tabsContainer}>
						<div className={styles.tabs}>
							{this.props.discussions.map(function(discussion, i) {
								return (
									<span key={discussion.api} className={classnames(styles.tab, { [styles.selected]: i === this.state.selected })} onClick={_.partial(this.select, i)}>
										{browser.i18n.getMessage('name_of_' + discussion.api)}
									</span>
								);
							}.bind(this))}
						</div>
					</div>
					<Discussion discussion={this.props.discussions[this.state.selected]} onLoad={this.props.onResize} />
				</div>
			</div>
		);
	}
}));

function discussionRequest(content, integration) {
	if (content.api === integration) {
		return Object.assign({ type: 'discussion' }, _.pick(content, 'api', 'id', 'as', 'for', 'account'));
	}
	return { api: integration, type: 'discussion', for: _.pick(content, 'api', 'type', 'id', 'as', 'for', 'account') };
}
