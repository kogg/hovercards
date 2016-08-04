var compression = require('compression');
var feathers    = require('feathers');
var helmet      = require('helmet');
var ua          = require('universal-analytics');

var PORT = process.env.PORT || 5100;

feathers()
	.use(helmet())
	.use(compression())
	.use('/v2', require('./api-routes'))
	.use('/v1', require('./old/hovercards'))
	.get('/', function(req, res) {
		res.redirect('http://www.hovercards.com');
	})
	.get(
		'/track_uninstall',
		process.env.GOOGLE_ANALYTICS_ID ?
			function(req, res, next) {
				ua(process.env.GOOGLE_ANALYTICS_ID, req.query.user_id, { strictCidFormat: false })
					.pageview('/track_uninstall')
					.send();
				next();
			} :
			function(req, res, next) {
				console.log('google analytics', ['send', 'pageview', '/track_uninstall']);
				next();
			},
		function(req, res) {
			res.redirect('https://hovercards.typeform.com/to/ajyJv2');
		}
	)
	.listen(PORT, function() {
		console.log('Server is running at', 'http://localhost:' + PORT);
	});
