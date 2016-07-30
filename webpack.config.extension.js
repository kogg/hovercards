var autoprefixer       = require('autoprefixer');
var nested             = require('postcss-nested');
var safeImportant      = require('postcss-safe-important');
var webpack            = require('webpack');
var CleanWebpackPlugin = require('clean-webpack-plugin');
var CopyWebpackPlugin  = require('copy-webpack-plugin');
var ExtractTextPlugin  = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin  = require('html-webpack-plugin');
var WriteFilePlugin    = require('write-file-webpack-plugin');

module.exports = {
	entry: {
		'background': './extension/index.background',
		'options':    './extension/index.options',
		'top-frame':  './extension/index.top-frame'
	},
	output: {
		filename:   '[name].js',
		path:       'dist',
		publicPath: 'chrome-extension://__MSG_@@extension_id__/'
	},
	module: {
		loaders: [
			{ exclude: 'node_modules', test: /\.(gif|png|jpe?g|svg)$/i, loaders: ['file?name=assets/images/[name].[ext]', 'image-webpack'] },
			{ exclude: 'node_modules', test: /\.html/, loader: 'ractive' },
			{ exclude: 'node_modules', test: /\.js$/, loader: 'babel?cacheDirectory' },
			{ exclude: 'node_modules', test: /\.json/, loader: 'json' },
			{ exclude: 'node_modules', test: /\.ract/, loader: 'ractive-component' },
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
			['.chrome', '.extension'],
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
	plugins: [
		new webpack.EnvironmentPlugin([
			'GOOGLE_ANALYTICS_ID',
			'INSTAGRAM_CLIENT_ID',
			'NODE_ENV',
			'REDDIT_CLIENT_ID',
			'SOUNDCLOUD_CLIENT_ID',
			'STICKYCARDS'
		]),
		new CleanWebpackPlugin(['dist']),
		new CopyWebpackPlugin([
			{ from: 'assets/images/logo-*', to: 'assets/images', flatten: true },
			{ from: 'extension/copy.json', to: '_locales/en/messages.json' },
			{ from: 'extension/manifest.json' }
		]),
		new ExtractTextPlugin('[name].css'),
		new HtmlWebpackPlugin({
			title:      'HoverCard Options',
			filename:   'options.html',
			template:   require('html-webpack-template'),
			inject:     false,
			chunks:     ['options'],
			appMountId: 'mount'
		}),
		new WriteFilePlugin({ log: false })
	],
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

function extensions(builds, extensions) {
	var results = [];

	[''].concat(builds).forEach(function(build) {
		[''].concat(extensions).forEach(function(extension) {
			if (Boolean(build) !== Boolean(extension)) {
				return;
			}
			results.push([build, extension].join(''));
		});
	});
	return results.concat(extensions);
}
