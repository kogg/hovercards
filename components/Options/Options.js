var _                        = require('underscore');
var compose                  = require('redux').compose;
var connect                  = require('react-redux').connect;
var createStructuredSelector = require('reselect').createStructuredSelector;
var React                    = require('react');

var actions            = require('../../redux/actions.options'); // TODO webpack/webpack#2801
var styles             = require('./Options.styles');
var IntegrationOptions = require('../IntegrationOptions/IntegrationOptions');

module.exports = connect(createStructuredSelector({
	options: _.property('options')
}))(React.createClass({
	displayName: 'Options',
	propTypes:   {
		dispatch: React.PropTypes.func.isRequired,
		options:  React.PropTypes.object.isRequired
	},
	render: function() {
		return (
			<div className={styles.integrationOptions}>
				<IntegrationOptions integration="imgur" options={this.props.options.imgur} setOption={compose(this.props.dispatch, actions.setOption)} options={this.props.options.imgur} />

				<IntegrationOptions integration="soundcloud" options={this.props.options.soundcloud} setOption={compose(this.props.dispatch, actions.setOption)} />
				<IntegrationOptions integration="youtube" options={this.props.options.youtube} setOption={compose(this.props.dispatch, actions.setOption)} />
				<IntegrationOptions integration="instagram" options={this.props.options.instagram} setOption={compose(this.props.dispatch, actions.setOption)} />
				<IntegrationOptions integration="reddit" options={this.props.options.reddit} setOption={compose(this.props.dispatch, actions.setOption)} />
				<IntegrationOptions integration="twitter" options={this.props.options.twitter} setOption={compose(this.props.dispatch, actions.setOption)} />
				{/*
					<button className={styles.saveButton}>{browser.i18n.getMessage('save_options')}</button>
				*/}
			</div>
		);
	}
}));
