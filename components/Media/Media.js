var React = require('react');

var Carousel         = require('../Carousel/Carousel');
var Gif              = require('../Gif/Gif');
var Image            = require('../Image/Image');
var SoundCloudPlayer = require('../SoundCloudPlayer/SoundCloudPlayer');
var Video            = require('../Video/Video');
var YoutubeVideo     = require('../YoutubeVideo/YoutubeVideo');
var styles           = require('./Media.styles');

module.exports = React.createClass({
	displayName: 'Media',
	propTypes:   {
		content:  React.PropTypes.object.isRequired,
		hovered:  React.PropTypes.bool.isRequired,
		onResize: React.PropTypes.func.isRequired
	},
	render: function() {
		switch (this.props.content.api) {
			case 'imgur':
				if (!this.props.content.content) {
					break;
				}
				return (
					<div className={styles.media}>
						<Carousel onResize={this.props.onResize}>
							{this.props.content.content.map(function(item, i) {
								return (
									<div key={i}>
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
					<div className={styles.media}>
						<SoundCloudPlayer content={this.props.content} image={this.props.content.image} muted={!this.props.hovered} onLoad={this.props.onResize} />
					</div>
				);
			case 'youtube':
				return (
					<div className={styles.media}>
						<YoutubeVideo content={this.props.content} image={this.props.content.image} muted={!this.props.hovered} onLoad={this.props.onResize} />
					</div>
				);
			default:
				break;
		}
		if (this.props.content.video) {
			return (
				<div className={styles.media}>
					<Video video={this.props.content.video} image={this.props.content.image} muted={!this.props.hovered} onLoad={this.props.onResize} />
				</div>
			);
		}
		if (this.props.content.gif) {
			return (
				<div className={styles.media}>
					<Gif gif={this.props.content.gif} image={this.props.content.image} onLoad={this.props.onResize} />
				</div>
			);
		}
		if (this.props.content.images) {
			return (
				<div className={styles.media}>
					<Carousel onResize={this.props.onResize}>
						{this.props.content.images.map(function(image, i) {
							return <Image key={i} image={image} onLoad={this.props.onResize} />;
						}.bind(this))}
					</Carousel>
				</div>
			);
		}
		if (this.props.content.image) {
			return (
				<div className={styles.media}>
					<Image image={this.props.content.image} onLoad={this.props.onResize} />
				</div>
			);
		}
		return null;
	}
});
