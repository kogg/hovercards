var source_index = {};

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
			source_index[this.from || sources[0]] = sources;
			var files = Object.keys(source_index).reduce(function(memo, from) {
				return memo.concat(source_index[from]);
			}, []);
			console.log('postcss', files);
			global.watchCSS(files);
		}
	},
	'postcss-map-url': function(path) {
		return (path.indexOf('data:') === 0 || path.indexOf('http') === 0) ? path : 'chrome-extension://__MSG_@@extension_id__/' + path;
	},
	'postcss-url': {
		url: 'copy',
		assetsPath: 'assets'
	}
};
