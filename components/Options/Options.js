var _                        = require('underscore');
var compose                  = require('redux').compose;
var connect                  = require('react-redux').connect;
var createStructuredSelector = require('reselect').createStructuredSelector;
var React                    = require('react');

var actions            = require('../../extension/actions');
var styles             = require('./Options.styles');
var IntegrationOptions = require('../IntegrationOptions/IntegrationOptions');

module.exports = connect(createStructuredSelector({
	settings: _.property('settings')
}))(React.createClass({
	displayName: 'Options',
	propTypes:   {
		dispatch: React.PropTypes.func.isRequired,
		settings: React.PropTypes.object.isRequired
	},
	render: function() {
		return (
			<div className={styles.integrationOptions}>
				<IntegrationOptions integration="imgur" settings={this.props.settings.imgur} setSetting={compose(this.props.dispatch, actions.setSetting)} settings={this.props.settings.imgur} />

				<IntegrationOptions integration="soundcloud" settings={this.props.settings.soundcloud} setSetting={compose(this.props.dispatch, actions.setSetting)} />
				<IntegrationOptions integration="youtube" settings={this.props.settings.youtube} setSetting={compose(this.props.dispatch, actions.setSetting)} />
				<IntegrationOptions integration="instagram" settings={this.props.settings.instagram} setSetting={compose(this.props.dispatch, actions.setSetting)} />
				<IntegrationOptions integration="reddit" settings={this.props.settings.reddit} setSetting={compose(this.props.dispatch, actions.setSetting)} />
				<IntegrationOptions integration="twitter" settings={this.props.settings.twitter} setSetting={compose(this.props.dispatch, actions.setSetting)} />
				{/*
					<button className={styles.saveButton}>{browser.i18n.getMessage('save_settings')}</button>
				*/}
			</div>
		);
	}
}));
