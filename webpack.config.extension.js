var _                        = require('underscore');
var BellOnBundlerErrorPlugin = require('bell-on-bundler-error-plugin');
var CleanWebpackPlugin       = require('clean-webpack-plugin');
var CopyWebpackPlugin        = require('copy-webpack-plugin');
var ExtractTextPlugin        = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin        = require('html-webpack-plugin');
var StringReplacePlugin      = require('string-replace-webpack-plugin');
var WriteFilePlugin          = require('write-file-webpack-plugin');
var autoprefixer             = require('autoprefixer');
var increaseSpecificity      = require('postcss-increase-specificity');
var nested                   = require('postcss-nested');
var path                     = require('path');
var raw                      = require('postcss-raw');
var safeImportant            = require('postcss-safe-important');
var webpack                  = require('webpack');

module.exports = {
	// FIXME https://github.com/webpack/webpack/issues/2801
	entry:  process.env.ENTRY ? { [process.env.ENTRY]: './extension/index' } : { manifest: './extension/manifest' },
	output: {
		filename:   '[name].js',
		path:       'dist',
		publicPath: process.env.ENTRY === 'top-frame' ? 'chrome-extension://__MSG_@@extension_id__/' : ''
	},
	module: {
		loaders: [
			{ exclude: 'node_modules', test: /\.(eot|ttf|(woff(2)?(\?v=\d\.\d\.\d)?))$/, loader: 'file?name=assets/fonts/[name].[ext]' },
			{ exclude: 'node_modules', test: /\.(gif|png|jpe?g|svg)$/i, loaders: ['file?name=assets/images/[name].[ext]', 'image-webpack'] },
			{ exclude: 'node_modules', test: /\.(js)$/, loader: 'babel?cacheDirectory' },
			{ exclude: ['node_modules', path.join(__dirname, 'extension/manifest.json')], test: /\.(json)$/, loader: 'json' },
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
			},
			{
				exclude: 'node_modules',
				test:    /manifest\.json$/,
				loaders: [
					'file?name=manifest.json',
					StringReplacePlugin.replace({
						replacements: [{
							pattern:     /__VERSION__/ig,
							replacement: function() {
								return require('./package').version || '0.0.1';
							}
						}]
					})
				]
			}
		],
		noParse: /node_modules\/json-schema\/lib\/validate\.js/
	},
	resolve: {
		extensions: extensions(
			process.env.ENTRY && ['.' + process.env.ENTRY, ''],
			['.extension', '.browser', ''],
			['.json', '.js', '.css']
		)
	},
	devtool:   process.env.NODE_ENV ? 'source-map' : 'cheap-source-map',
	devServer: {
		outputPath: 'dist',
		port:       process.env.PORT,
		stats:      { colors: true }
	},
	node: {
		console: true,
		dns:     'empty',
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
			'ROLLBAR_CLIENT_ACCESS_TOKEN',
			'SOUNDCLOUD_CLIENT_ID',
			'STICKYCARDS',
			'npm_package_gitHead'
		]),
		new BellOnBundlerErrorPlugin(),
		!process.env.ENTRY && !process.env.NODE_ENV && new CleanWebpackPlugin(['dist']),
		!process.env.ENTRY && new CopyWebpackPlugin([
			{ from: 'assets/images/logo-*', to: 'assets/images', flatten: true },
			{ from: 'extension/copy.json', to: '_locales/en/messages.json' }
		]),
		new ExtractTextPlugin('[name].css'),
		process.env.ENTRY === 'options' && new HtmlWebpackPlugin({
			title:      'HoverCard Options',
			filename:   'options.html',
			template:   require('html-webpack-template'),
			inject:     false,
			appMountId: 'mount'
		}),
		new StringReplacePlugin(),
		new WriteFilePlugin({ log: false })
	]),
	postcss: function() {
		return process.env.ENTRY === 'top-frame' ?
			[
				nested({ bubble: ['raw'] }),
				autoprefixer,
				raw.inspect(),
				increaseSpecificity({ stackableRoot: ':global(.hovercards-root)', repeat: 1 }),
				raw.write(),
				safeImportant
			] :
			[
				nested,
				autoprefixer
			];
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
				if (!injection && !build && !extension) {
					return;
				}
				results.push([injection, build, extension].join(''));
			});
		});
	});
	return results;
}
