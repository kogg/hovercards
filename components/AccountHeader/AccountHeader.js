var React      = require('react');
var classnames = require('classnames');

var dom    = require('../../utils/dom');
var styles = require('./AccountHeader.styles');

module.exports = React.createClass({
	displayName: 'AccountHeader',
	propTypes:   {
		account:   React.PropTypes.object.isRequired,
		className: React.PropTypes.string
	},
	componentDidMount: function() {
		if (this.props.account.content && this.props.account.content.content) {
			Promise
				.all(this.props.account.content.content.slice(0, 3).map(function(content) {
					return dom.imageLoaded(content.image.medium || content.image.large || content.image.small);
				}))
				.then(this.props.onResize);
		} else if (this.props.account.banner) {
			dom.imageLoaded(this.props.account.banner).then(this.props.onResize);
		}
	},
	componentDidUpdate: function() {
		if (this.props.account.content && this.props.account.content.content) {
			Promise
				.all(this.props.account.content.content.slice(0, 3).map(function(content) {
					return dom.imageLoaded(content.image.medium || content.image.large || content.image.small);
				}))
				.then(this.props.onResize);
		} else if (this.props.account.banner) {
			dom.imageLoaded(this.props.account.banner).then(this.props.onResize);
		}
	},
	render: function() {
		if (this.props.account.content && this.props.account.content.content) {
			return (
				<div className={classnames(styles.banner, this.props.className)}>
					{this.props.account.content.content.slice(0, 3).map(function(content) {
						return <div className={styles.bannerImage} style={{ backgroundImage: 'url(' + (content.image.medium || content.image.large || content.image.small) + ')' }}></div>;
					})}
				</div>
			);
		}
		if (this.props.account.banner) {
			return <div className={classnames(styles.banner, this.props.className)} style={{ backgroundImage: 'url(' + this.props.account.banner + ')' }}></div>;
		}
		return null;
	}
});

