var React      = require('react');
var classnames = require('classnames');

var dom    = require('../../utils/dom');
var styles = require('./OEmbed.styles');

module.exports = React.createClass({
	displayName: 'OEmbed',
	propTypes:   {
		className: React.PropTypes.string,
		image:     React.PropTypes.object,
		oembed:    React.PropTypes.string.isRequired,
		onLoad:    React.PropTypes.func.isRequired
	},
	componentDidMount: function() {
		this.massageIframe();
	},
	componentDidUpdate: function(prevProps) {
		if (this.props.oembed === prevProps.oembed) {
			return;
		}
		this.massageIframe();
	},
	componentWillUnmount: function() {
		var iframe = this.refs.container.children[0];
		iframe.removeEventListener('onload', this.onLoad);
	},
	massageIframe: function() {
		var iframe = this.refs.container.children[0];
		dom.addClass(iframe, classnames(styles.oembed, this.props.className));
		iframe.style.height = (iframe.height / iframe.width * this.refs.container.offsetWidth) + 'px';
		iframe.addEventListener('onload', this.onLoad);
	},
	render: function() {
		return (
			<div className={styles.oembedContainer}
				ref="container"
				style={{ backgroundImage: this.props.image && ('url(' + (this.props.image.medium || this.props.image.large || this.props.image.small) + ')') }}
				dangerouslySetInnerHTML={{ __html: this.props.oembed }} />
		);
	}
});
