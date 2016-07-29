var _                        = require('underscore');
var connect                  = require('react-redux').connect;
var createStructuredSelector = require('reselect').createStructuredSelector;
var React                    = require('react');

var actions            = require('../../redux/actions.options'); // TODO webpack/webpack#2801
var styles             = require('./Options.styles');
var IntegrationOptions = require('../IntegrationOptions/IntegrationOptions');

module.exports = connect(
	createStructuredSelector({
		options: _.property('options')
	}),
	actions
)(React.createClass({
	displayName: 'Options',
	propTypes:   {
		options:   React.PropTypes.object.isRequired,
		setOption: React.PropTypes.func.isRequired
	},
	render: function() {
		return (
			<div className={styles.options}>
				<IntegrationOptions integration="imgur" options={this.props.options.imgur} setOption={this.props.setOption} options={this.props.options.imgur} />
				<IntegrationOptions integration="soundcloud" options={this.props.options.soundcloud} setOption={this.props.setOption} />
				<IntegrationOptions integration="youtube" options={this.props.options.youtube} setOption={this.props.setOption} />
				<IntegrationOptions integration="instagram" options={this.props.options.instagram} setOption={this.props.setOption} />
				<IntegrationOptions integration="reddit" options={this.props.options.reddit} setOption={this.props.setOption} />
				<IntegrationOptions integration="twitter" options={this.props.options.twitter} setOption={this.props.setOption} />
				{/*
					<button className={styles.save}>{browser.i18n.getMessage('save_options')}</button>
				*/}
			</div>
		);
	}
}));
