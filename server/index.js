var compression = require('compression');
var feathers    = require('feathers');
var helmet      = require('helmet');
var ua          = require('universal-analytics');

var PORT = process.env.PORT || 5100;

feathers()
	.use(helmet())
	.use(compression())
	.use('/v2', require('./api-routes'))
	.get('/', function(req, res) {
		res.redirect(process.env.npm_package_homepage);
	})
	.get('/track_uninstall', function(req, res) {
		if (process.env.GOOGLE_ANALYTICS_ID) {
			ua(process.env.GOOGLE_ANALYTICS_ID, req.query.user_id, { strictCidFormat: false })
				.pageview('/track_uninstall')
				.send();
		} else {
			console.log('google analytics', ['send', 'pageview', '/track_uninstall']);
		}
		res.redirect('https://hovercards.typeform.com/to/ajyJv2');
	})
	.listen(PORT, function() {
		console.log('Server is running at', 'http://localhost:' + PORT);
	});
