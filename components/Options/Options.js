var React = require('react');

var browser            = require('../../extension/browser');
var styles             = require('./Options.styles');
var IntegrationOptions = require('../IntegrationOptions/IntegrationOptions');

module.exports = React.createClass({
	displayName: 'Options',
	render:      function() {
		return (
			<div className={styles.integrationOptions}>
				<IntegrationOptions integration="imgur" />
				<IntegrationOptions integration="soundcloud" />
				<IntegrationOptions integration="youtube" />
				<IntegrationOptions integration="instagram" />
				<IntegrationOptions integration="reddit" />
				<IntegrationOptions integration="twitter" />
				<button className={styles.saveButton}>{browser.i18n.getMessage('save_settings')}</button>
			</div>
		);
	}
});
