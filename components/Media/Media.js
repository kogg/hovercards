var React      = require('react');
var classnames = require('classnames');
var connect    = require('react-redux').connect;

var Carousel         = require('../Carousel/Carousel');
var Gif              = require('../Gif/Gif');
var Image            = require('../Image/Image');
var OEmbed           = require('../OEmbed/OEmbed');
var SoundCloudPlayer = require('../SoundCloudPlayer/SoundCloudPlayer');
var Video            = require('../Video/Video');
var YoutubeVideo     = require('../YoutubeVideo/YoutubeVideo');
var actions          = require('../../redux/actions');
var entityLabel      = require('../../utils/entity-label');
var report           = require('../../report');
var styles           = require('./Media.styles');

module.exports = connect(null, actions)(React.createClass({
	displayName: 'Media',
	propTypes:   {
		analytics: React.PropTypes.func.isRequired,
		className: React.PropTypes.string,
		content:   React.PropTypes.object.isRequired,
		hovered:   React.PropTypes.bool.isRequired,
		onResize:  React.PropTypes.func.isRequired
	},
	onCarouselChange: function(index, how) {
		this.props.analytics(['send', 'event', entityLabel(this.props.content, true), 'Carousel Changed', how, index])
			.catch(report.error);
	},
	render: function() {
		switch (this.props.content.api) {
			case 'imgur':
				if (!this.props.content.content) {
					break;
				}
				return (
					<div className={classnames(styles.media, this.props.className)}>
						<Carousel onResize={this.props.onResize} onChange={this.onCarouselChange}>
							{this.props.content.content.map(function(item, i) {
								return (
									<div key={item.id || i}>
										{
											item.gif ?
												<Gif gif={item.gif} image={item.image} onLoad={this.props.onResize} /> :
												<Image image={item.image} onLoad={this.props.onResize} />
										}
										<div className={styles.description}>
											<b className={styles.name}>{ item.name }</b>
											<p className={styles.text} dangerouslySetInnerHTML={{ __html: item.text }} />
										</div>
									</div>
								);
							}.bind(this))}
						</Carousel>
					</div>
				);
			case 'soundcloud':
				return (
					<div className={classnames(styles.media, this.props.className)}>
						<SoundCloudPlayer content={this.props.content} image={this.props.content.image} muted={!this.props.hovered} onLoad={this.props.onResize} />
					</div>
				);
			case 'youtube':
				return (
					<div className={classnames(styles.media, this.props.className)}>
						<YoutubeVideo content={this.props.content} image={this.props.content.image} muted={!this.props.hovered} onLoad={this.props.onResize} />
					</div>
				);
			default:
				break;
		}
		if (this.props.content.oembed) {
			return (
				<div className={classnames(styles.media, this.props.className)}>
					<OEmbed oembed={this.props.content.oembed} image={this.props.content.image} onLoad={this.props.onResize} />
				</div>
			);
		}
		if (this.props.content.video) {
			return (
				<div className={classnames(styles.media, this.props.className)}>
					<Video video={this.props.content.video} image={this.props.content.image} muted={!this.props.hovered} onLoad={this.props.onResize} />
				</div>
			);
		}
		if (this.props.content.gif) {
			return (
				<div className={classnames(styles.media, this.props.className)}>
					<Gif gif={this.props.content.gif} image={this.props.content.image} onLoad={this.props.onResize} />
				</div>
			);
		}
		if (this.props.content.images) {
			return (
				<div className={classnames(styles.media, this.props.className)}>
					<Carousel onResize={this.props.onResize} onChange={this.onCarouselChange}>
						{this.props.content.images.map(function(image, i) {
							return <Image key={i} image={image} onLoad={this.props.onResize} />;
						}.bind(this))}
					</Carousel>
				</div>
			);
		}
		if (this.props.content.image) {
			return (
				<div className={classnames(styles.media, this.props.className)}>
					<Image image={this.props.content.image} onLoad={this.props.onResize} />
				</div>
			);
		}
		return null;
	}
}));
