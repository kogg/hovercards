var autoprefixer       = require('autoprefixer');
var nested             = require('postcss-nested');
var safeImportant      = require('postcss-safe-important');
var webpack            = require('webpack');
var CleanWebpackPlugin = require('clean-webpack-plugin');
var CopyWebpackPlugin  = require('copy-webpack-plugin');
var DotenvPlugin       = require('webpack-dotenv-plugin');
var ExtractTextPlugin  = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin  = require('html-webpack-plugin');
var WriteFilePlugin    = require('write-file-webpack-plugin');

module.exports = {
	entry: {
		options: './extension/entry.options.js'
	},
	output: {
		filename: '[name].js',
		path:     'dist'
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
		extensions: [
			'',
			'.chrome.json', '.chrome.js', '.chrome.css',
			'.webpack.js', '.web.js', '.json', '.js', '.css'
		]
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
			'INSTAGRAM_CLIENT_ID',
			'NODE_ENV',
			'STICKYCARDS'
		]),
		new CopyWebpackPlugin([
			{ from: 'assets/images/logo-*', to: 'assets/images', flatten: true },
			{ from: 'extension/copy.json', to: '_locales/en/messages.json' },
			{ from: 'extension/manifest.json' }
		]),
		new ExtractTextPlugin('[name].css'),
		new HtmlWebpackPlugin({
			title:      'My Test Extension Options',
			filename:   'options.html',
			template:   require('html-webpack-template'),
			inject:     false,
			chunks:     ['options'],
			appMountId: 'mount'
		})
	],
	postcss: function() {
		return [nested, autoprefixer, safeImportant];
	}
};

if (!process.env.NODE_ENV) {
	module.exports.plugins = module.exports.plugins.concat([
		new CleanWebpackPlugin(['dist']),
		new DotenvPlugin(),
		new WriteFilePlugin({ log: false })
	]);
}
