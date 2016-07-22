var safeImportant      = require('postcss-safe-important');
var webpack            = require('webpack');
var DotenvPlugin       = require('webpack-dotenv-plugin');
var CleanWebpackPlugin = require('clean-webpack-plugin');
var CopyWebpackPlugin  = require('copy-webpack-plugin');
var ExtractTextPlugin  = require('extract-text-webpack-plugin');
var WriteFilePlugin    = require('write-file-webpack-plugin');

module.exports = {
	entry: {
		'background':  ['./app/background.js'],
		'every-frame': ['./app/every-frame.js'],
		'options':     ['./app/options.js'],
		'top-frame':   ['./app/top-frame.js']
	},
	output: {
		path:     'dist',
		filename: '[name].js'
	},
	module: {
		loaders: [
			{ test: /\.js$/, loaders: ['babel?cacheDirectory'], exclude: 'node_modules' },
			{ test: /\.css$/, loader: ExtractTextPlugin.extract(['css?sourceMap&modules&localIdentName=HOVERCARDS-[local]&importLoaders=1', 'postcss']), exclude: 'node_modules' },
			{ test: /\.json/, loaders: ['json'], exclude: 'node_modules' },
			{ test: /\.html/, loaders: ['ractive'], exclude: 'node_modules' },
			{ test: /\.ract/, loaders: ['ractive-component'], exclude: 'node_modules' },
			{ test: /.*\.(gif|png|jpe?g|svg)$/i, loaders: ['url?name=assets/images/[name].[ext]', 'image-webpack'], exclude: 'node_modules' },
			{ test: /\.ttf$|\.eot$/, loaders: ['file?name=assets/fonts/[name].[ext]'], exclude: 'node_modules' },
			{ test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loaders: ['url?name=assets/fonts/[name].[ext]'], exclude: 'node_modules' }
		],
		noParse: /node_modules\/json-schema\/lib\/validate\.js/
	},
	postcss: function() {
		return [safeImportant];
	},
	node: {
		console: true,
		fs:      'empty',
		net:     'empty',
		tls:     'empty'
	},
	plugins: [
		new webpack.EnvironmentPlugin([
			'INSTAGRAM_CLIENT_ID',
			'NODE_ENV',
			'STICKYCARDS'
		]),
		new CopyWebpackPlugin([
			{ from: 'app/copy.json', to: '_locales/en/messages.json' },
			{ from: 'app/manifest.json' },
			{ from: 'app/options.html' },
			{ from: 'assets/images/*-icon-full_color.png', to: 'assets/images', flatten: true },
			{ from: 'assets/images/logo-*', to: 'assets/images', flatten: true }
		]),
		new ExtractTextPlugin('[name].css')
	],
	devServer: {
		outputPath: 'dist',
		port:       3030
	},
	devtool: 'source-map'
};

if (!process.env.NODE_ENV) {
	module.exports.plugins = module.exports.plugins.concat([
		new CleanWebpackPlugin(['dist']),
		new DotenvPlugin(),
		new WriteFilePlugin({ log: false })
	]);
}
