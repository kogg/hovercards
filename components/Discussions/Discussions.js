var _          = require('underscore');
var React      = require('react');
var classnames = require('classnames');
var connect    = require('react-redux').connect;

var DiscussionComment = require('../DiscussionComment/DiscussionComment');
var Err               = require('../Err/Err');
var Loading           = require('../Loading/Loading');
var actions           = require('../../redux/actions.top-frame');
var browser           = require('../../extension/browser');
var config            = require('../../integrations/config');
var entityLabel       = require('../../utils/entity-label');
var styles            = require('./Discussions.styles');

module.exports = connect(
	function(state, ownProps) {
		// TODO Should come from Hovercards... also, gross
		return {
			discussions: config.integrations[ownProps.content.api].discussion.integrations.map(function(integration) {
				var request = discussionRequest(ownProps.content, integration);

				return state.entities[entityLabel(request)] || request;
			})
		};
	},
	actions
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
		return { loaded: {} };
	},
	componentDidMount: function() {
		this.props.getEntity(this.props.discussions[0]);
		this.setState({ loaded: Object.assign({}, this.state.loaded, { 0: true }) });
	},
	componentDidUpdate: function(prevProps, prevState) {
		if (_.isNumber(this.state.selected) && (this.state.selected !== prevState.selected || this.props.discussions[this.state.selected].loaded !== prevProps.discussions[this.state.selected].loaded || this.props.discussions[this.state.selected].err !== prevProps.discussions[this.state.selected].err)) {
			this.props.onResize();
		}
		if (entityLabel(this.props.content) !== entityLabel(prevProps.content)) {
			this.setState({ selected: this.state.clicked ? this.state.selected : null, loaded: {} });
			return;
		}
		this.props.discussions.forEach(function(discussion, i) {
			if (entityLabel(discussion) === entityLabel(prevProps.discussions[i])) {
				return;
			}
			this.setState({ loaded: Object.assign({}, this.state.loaded, { [i]: false }) });
		}.bind(this));

		if (_.isNumber(this.state.selected)) {
			return;
		}

		for (var i = 0; i < this.props.discussions.length; i++) {
			var discussion = this.props.discussions[i];

			if (!discussion.loaded && !discussion.err) {
				if (!this.state.loaded[i]) {
					this.props.getEntity(discussion);
					this.setState({ loaded: Object.assign({}, this.state.loaded, { [i]: true }) });
				}
				return;
			}

			if (discussion.comments && discussion.comments.length) {
				this.setState({ selected: i });
				return;
			}
		}
		this.setState({ selected: 0 });
	},
	select: function(i) {
		if (!this.state.loaded[i]) {
			this.props.getEntity(this.props.discussions[i]);
		}
		this.setState({ clicked: true, selected: i, loaded: Object.assign({}, this.state.loaded, { [i]: true }) });
	},
	render: function() {
		var discussion = this.props.discussions[this.state.selected];

		return (
			<div className={classnames(styles.discussionsContainer, this.props.className)}>
				<div className={styles.discussions}>
					{
						(this.props.discussions.length > 1 || this.props.discussions[0].api !== this.props.content.api) &&
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
					}
					{discussion && discussion.err && <Err error={discussion.err} />}
					{(!discussion || (!discussion.err && !discussion.loaded)) && <Loading />}
					{discussion && !discussion.err && discussion.loaded && (
						discussion.comments && discussion.comments.length &&
						<div>
							{discussion.comments.map(function(comment, i) {
								return <DiscussionComment key={comment.id || i} comment={comment} integration={discussion.api} />;
							})}
						</div>
					)}
				</div>
			</div>
		);
	}
}));

function discussionRequest(content, integration) {
	// TODO Roll this into something reused in integrations/index.extension.js
	if (content.api === integration) {
		return Object.assign({ type: 'discussion' }, _.pick(content, 'api', 'id', 'as', 'for', 'account'));
	}
	return { api: integration, type: 'discussion', for: _.pick(content, 'api', 'type', 'id', 'as', 'for', 'account') };
}
