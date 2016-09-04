var _          = require('underscore');
var React      = require('react');
var classnames = require('classnames');
var connect    = require('react-redux').connect;

var DiscussionComment = require('../DiscussionComment/DiscussionComment');
var Err               = require('../Err/Err');
var Loading           = require('../Loading/Loading');
var actions           = require('../../redux/actions');
var browser           = require('../../extension/browser');
var config            = require('../../integrations/config');
var entityLabel       = require('../../utils/entity-label');
var report            = require('../../report');
var styles            = require('./Discussions.styles');

module.exports = connect(
	function(state, ownProps) {
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
		analytics:   React.PropTypes.func.isRequired,
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
		this.props.getEntity(this.props.discussions[0])
			.catch(report.catchException);
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
					this.props.getEntity(discussion)
						.catch(report.catchException);
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
			this.props.getEntity(this.props.discussions[i])
				.catch(report.catchException);
		}
		this.setState({ clicked: true, selected: i, loaded: Object.assign({}, this.state.loaded, { [i]: true }) });
		if (this.state.selected !== i) {
			this.props.analytics(['send', 'event', entityLabel(this.props.content, true), 'Discussion Selected', entityLabel(this.props.discussions[i], true), i])
				.catch(report.catchException);
		}
	},
	onClickCommentText: function(e) {
		var element = e.target;
		while (element && element.tagName.toLowerCase() !== 'a') {
			if (element === this.refs.discussion) {
				return;
			}
			element = element.parentNode;
		}
		if (!element.href) {
			return;
		}
		e.stopPropagation();
		if (element.target !== '_blank') {
			e.preventDefault();
			window.open(element.href);
		}
		this.props.analytics(['send', 'event', entityLabel(this.props.content, true), 'Link Opened', 'in a ' + entityLabel(this.props.discussions[this.state.selected], true)])
			.catch(report.catchException);
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
						<div ref="discussion">
							{discussion.comments.map(function(comment, i) {
								return <DiscussionComment key={comment.id || i} comment={comment} integration={discussion.api} onClickText={this.onClickCommentText} />;
							}.bind(this))}
						</div>
					)}
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
