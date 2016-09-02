var React      = require('react');
var classnames = require('classnames');

var styles = require('./Loading.styles');

// TODO https://github.com/kogg/hovercards/issues/33
module.exports = React.createClass({
	displayName: 'Loading',
	propTypes:   {
		className: React.PropTypes.string
	},
	render: function() {
		return <div className={classnames(styles.loadingContainer, this.props.className)}><div className={styles.loading} /></div>;
	}
});
