var express = require('express');
var os      = require('os');

var app = express();

app.set('port', process.env.PORT || 5000);

app.get('/', function(req, res) {
	res.redirect('http://www.hovercards.com');
});
app.use('/v2', require('./api-routes'));
app.use('/v1', require('./old/hovercards'));
// app.use('/', require('./view-routes'));

app.listen(app.get('port'), function() {
	console.log('Server is running at', 'http://' + os.hostname() + ':' + app.get('port'));
});
