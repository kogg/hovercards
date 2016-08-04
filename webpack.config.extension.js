var _                  = require('underscore');
var CleanWebpackPlugin = require('clean-webpack-plugin');
var CopyWebpackPlugin  = require('copy-webpack-plugin');
var ExtractTextPlugin  = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin  = require('html-webpack-plugin');
var WriteFilePlugin    = require('write-file-webpack-plugin');
var autoprefixer       = require('autoprefixer');
var nested             = require('postcss-nested');
var safeImportant      = require('postcss-safe-important');
var webpack            = require('webpack');

module.exports = {
	// FIXME This is some straight up bullshit https://github.com/webpack/webpack/issues/2801
	entry:  process.env.ENTRY ? { [process.env.ENTRY]: './extension/index.' + process.env.ENTRY } : {},
	output: {
		filename:   '[name].js',
		path:       'dist',
		publicPath: process.env.ENTRY === 'options' ? '' : 'chrome-extension://__MSG_@@extension_id__/'
	},
	module: {
		loaders: [
			{ exclude: 'node_modules', test: /\.(gif|png|jpe?g|svg)$/i, loaders: ['file?name=assets/images/[name].[ext]', 'image-webpack'] },
			{ exclude: 'node_modules', test: /\.js$/, loader: 'babel?cacheDirectory' },
			{ exclude: 'node_modules', test: /\.json/, loader: 'json' },
			{ exclude: 'node_modules', test: /\.ttf$|\.eot$/, loader: 'file?name=assets/fonts/[name].[ext]' },
			{ exclude: 'node_modules', test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'file?name=assets/fonts/[name].[ext]' },
			{
				exclude: 'node_modules',
				test:    /\.css$/,
				loader:  ExtractTextPlugin.extract(
					'style',
					[
						'css?-autoprefixer&camelCase&modules&sourceMap&importLoaders=1' + (process.env.NODE_ENV ? '' : '&localIdentName=[name]---[local]---[hash:base64:10]'),
						'postcss'
					]
				)
			}
		],
		noParse: /node_modules\/json-schema\/lib\/validate\.js/ },
	resolve: {
		extensions: extensions(
			process.env.ENTRY && ['.' + process.env.ENTRY, ''],
			['.chrome', '.extension', ''],
			['.json', '.js', '.css']
		)
	},
	devtool:   'source-map',
	devServer: {
		outputPath: 'dist',
		port:       process.env.PORT,
		stats:      { colors: true }
	},
	node: {
		console: true,
		fs:      'empty',
		net:     'empty',
		tls:     'empty'
	},
	plugins: _.compact([
		new webpack.EnvironmentPlugin([
			'GOOGLE_ANALYTICS_ID',
			'INSTAGRAM_CLIENT_ID',
			'NODE_ENV',
			'REDDIT_CLIENT_ID',
			'SOUNDCLOUD_CLIENT_ID',
			'STICKYCARDS'
		]),
		!process.env.ENTRY && new CleanWebpackPlugin(['dist']),
		!process.env.ENTRY && new CopyWebpackPlugin([
			{ from: 'assets/images/logo-*', to: 'assets/images', flatten: true },
			{ from: 'extension/copy.json', to: '_locales/en/messages.json' },
			{ from: 'extension/manifest.json' }
		]),
		new ExtractTextPlugin('[name].css'),
		process.env.ENTRY === 'options' && new HtmlWebpackPlugin({
			title:      'HoverCard Options',
			filename:   'options.html',
			template:   require('html-webpack-template'),
			inject:     false,
			appMountId: 'mount'
		}),
		new WriteFilePlugin({ log: false })
	]),
	postcss: function() {
		return [nested, autoprefixer, safeImportant];
	}
};

if (!process.env.NODE_ENV) {
	var DotenvPlugin = require('webpack-dotenv-plugin');

	module.exports.plugins = module.exports.plugins.concat([
		new DotenvPlugin()
	]);
}

function extensions(injections, builds, extensions) {
	var results = [''];

	[].concat(injections).forEach(function(injection) {
		[].concat(builds).forEach(function(build) {
			[].concat(extensions).forEach(function(extension) {
				if (!Boolean(injection) && !Boolean(build) && !Boolean(extension)) {
					return;
				}
				results.push([injection, build, extension].join(''));
			});
		});
	});
	return results;
}
