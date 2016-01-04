module.exports = {
	use: [
		'postcss-import',
		'autoprefixer',
		'postcss-color-rgba-fallback',
		'postcss-extend',
		'postcss-class-prefix',
		'postcss-url',
		'postcss-map-url',
		'postcss-safe-important',
		'postcss-reporter'
	],
	'postcss-class-prefix': '__MSG_@@extension_id__-',
	'postcss-import': {
		glob: true
	},
	'postcss-map-url': function(path) {
		return (path.indexOf('data:') === 0 || path.indexOf('http') === 0) ? path : 'chrome-extension://__MSG_@@extension_id__/' + path;
	},
	'postcss-url': {
		url: 'copy',
		assetsPath: 'assets'
	}
};
