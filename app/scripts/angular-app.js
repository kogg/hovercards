var $       = require('jquery');
var angular = require('angular');

var app = angular.module('app', [require('angular-animate'),
                                 require('angular-sanitize'),
                                 require('angular-inview/angular-inview') && 'angular-inview']);

app.filter('readmore',                require('./readmore-directive'));
app.filter('sortable',                require('./sortable-directive'));
app.filter('youtubeChannelSubscribe', require('./youtube-channel-subscribe-directive'));

app.filter('copy',             require('./copy-filter'));
app.filter('htmlify',          require('./htmlify-filter'));
app.filter('numsmall',         require('./numsmall-filter'));
app.filter('trustresourceurl', require('./trust-resource-url-filter'));

module.exports = app;
