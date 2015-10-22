module.exports = {
	use: [
		'postcss-import',
		'autoprefixer',
		'postcss-color-rgba-fallback',
		'postcss-class-prefix',
		'postcss-url',
		'postcss-map-url',
		'postcss-reporter'
	],
	'postcss-class-prefix': '__MSG_@@extension_id__-',
	'postcss-import': {
		glob: true,
		onImport: function(sources) {
			console.log('postcss', sources);
			global.watchCSS(sources);
		}
	},
	'postcss-map-url': function(path) {
		return (path.indexOf('data:') !== -1) ? path : 'chrome-extension://__MSG_@@extension_id__/' + path;
	},
	'postcss-url': {
		url: 'copy'
	}
};
