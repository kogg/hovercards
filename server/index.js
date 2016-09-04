var compression = require('compression');
var feathers    = require('feathers');
var helmet      = require('helmet');
var raven       = require('raven');
var ua          = require('universal-analytics');

var report = require('../report');

var PORT = process.env.PORT || 5100;

feathers()
	.use(helmet())
	.use(compression())
	.use(raven.middleware.express.requestHandler(report))
	.use('/v2', require('./v2'))
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

	.use(function(err, req, res, next) { // eslint-disable-line no-unused-vars
		if (!err.code || err.code < 400 || err.code >= 500) {
			return next(err);
		}
		err.message = err.message || 'Do not recognize url ' + req.path;
		res.status(err.code || 500).json(err);
	})
	.use(raven.middleware.express.errorHandler(report))
	.use(function(err, req, res, next) { // eslint-disable-line no-unused-vars
		err.message = err.message || 'Do not recognize url ' + req.path;
		res.status(err.code || 500).json(err);
	})

	.listen(PORT, function() {
		console.log('Server is running at', 'http://localhost:' + PORT);
	});
