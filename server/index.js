var compression = require('compression');
var feathers    = require('feathers');
var helmet      = require('helmet');

var PORT = process.env.PORT || 5100;

feathers()
	.use(helmet())
	.use(compression())
	.get('/', function(req, res) {
		res.redirect('http://www.hovercards.com');
	})
	.use('/v2', require('./api-routes'))
	.use('/v1', require('./old/hovercards'))
	.listen(PORT, function() {
		console.log('Server is running at', 'http://localhost:' + PORT);
	});
