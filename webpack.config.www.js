var BellOnBundlerErrorPlugin = require('bell-on-bundler-error-plugin');
var CopyWebpackPlugin        = require('copy-webpack-plugin');
var ExtractTextPlugin        = require('extract-text-webpack-plugin');
var FaviconsWebpackPlugin    = require('favicons-webpack-plugin');
var HtmlWebpackPlugin        = require('html-webpack-plugin');
var autoprefixer             = require('autoprefixer');
var nested                   = require('postcss-nested');

module.exports = {
	entry: {
		main:    './www/js/main.js',
		privacy: './www/js/privacy.js'
	},
	output: {
		path:     'dist-www',
		filename: '[name].[hash].js'
	},
	module: {
		loaders: [
			{ exclude: 'node_modules', test: /\.css$/, loader: ExtractTextPlugin.extract('style', ['css?-autoprefixer&importLoaders=1&sourceMap', 'postcss']) },
			{ exclude: 'node_modules', test: /\.(gif|png|jpe?g|svg)$/i, loaders: ['url?name=images/[name].[hash].[ext]&limit=10000', 'image-webpack'] },
			{ exclude: 'node_modules', test: /\.html/, loader: 'html?attrs[]=img:src&attrs[]=link:href' },
			{ exclude: 'node_modules', test: /\.js$/, loader: 'babel?cacheDirectory' },
			{ exclude: 'node_modules', test: /\.json/, loader: 'file?name=[name].[hash].[ext]' },
			{ exclude: 'node_modules', test: /\.ttf$|\.eot$/, loader: 'file?name=fonts/[name].[hash].[ext]' },
			{ exclude: 'node_modules', test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'url?name=fonts/[name].[hash].[ext]&limit=10000' }
		]
	},
	resolve: {
		extensions: extensions(
			[''],
			['.www', '.browser', ''],
			['.json', '.js', '.css']
		)
	},
	devtool:   process.env.NODE_ENV ? 'cheap-source-map' : 'cheap-module-eval-source-map',
	devServer: {
		port:  process.env.PORT,
		stats: { colors: true }
	},
	plugins: [
		new BellOnBundlerErrorPlugin(),
		new CopyWebpackPlugin([
			{ from: 'assets/images/facebeefbanner.jpg', to: 'images' },
			{ from: 'www/CNAME' }
		]),
		new ExtractTextPlugin('[name].[hash].css'),
		new FaviconsWebpackPlugin({ logo: './assets/images/logo.png', title: 'HoverCards', prefix: 'favicons-[hash]/' }),
		new HtmlWebpackPlugin({ chunks: ['main'], template: 'www/index.html' }),
		new HtmlWebpackPlugin({ chunks: ['privacy'], template: 'www/privacy.html', filename: 'privacy.html' })
	],
	postcss: function() {
		return [nested, autoprefixer];
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
