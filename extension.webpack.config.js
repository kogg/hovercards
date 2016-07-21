var CleanWebpackPlugin = require('clean-webpack-plugin');
var ExtractTextPlugin  = require('extract-text-webpack-plugin');
var WriteFilePlugin    = require('write-file-webpack-plugin');

module.exports = {
	entry: {
		'background':    ['./app/background.js'],
		'every-frame':   ['./app/every-frame.js'],
		'options-frame': ['./app/options.js'],
		'top-frame':     ['./app/top-frame.js']
	},
	output: {
		path:     'dist',
		filename: '[name].js'
	},
	module: {
		loaders: [
			{ test: /\.json/, loaders: ['json'], exclude: 'node_modules' },
			{ test: /.*\.(gif|png|jpe?g|svg)$/i, loaders: ['url?name=images/[name].[hash].[ext]&limit=10000', 'image-webpack'], exclude: 'node_modules' },
			{ test: /\.css$/, loader: ExtractTextPlugin.extract('style', 'css'), exclude: 'node_modules' },
			{ test: /\.ttf$|\.eot$/, loaders: ['file?name=fonts/[name].[hash].[ext]'], exclude: 'node_modules' },
			{ test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loaders: ['url?name=fonts/[name].[hash].[ext]&limit=10000'], exclude: 'node_modules' }
		]
	},
	node: {
		console: true,
		fs:      'empty',
		net:     'empty',
		tls:     'empty'
	},
	plugins: [
		new CleanWebpackPlugin(['dist']),
		new ExtractTextPlugin('[name].css'),
		new WriteFilePlugin({ log: false })
	],
	devServer: {
		port: 3030
	},
	devtool: 'source-map'
};
