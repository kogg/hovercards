require('jquery');
var angular = require('angular');

var app = angular.module('app', [require('angular-animate'),
                                 require('angular-sanitize'),
                                 require('angular-inview/angular-inview') && 'angular-inview',
                                 require('./content-components'),
                                 require('./discussion-components'),
                                 require('./people-components'),
                                 require('./more-content-components')]);

app.directive('entry',       require('./entry-directive'));
app.directive('error',       require('./error-directive'));

app.directive('readmore',                require('./readmore-directive'));
app.directive('sortable',                require('./sortable-directive'));
app.directive('youtubeChannelSubscribe', require('./youtube-channel-subscribe-directive'));

app.filter('copy',             require('./copy-filter'));
app.filter('htmlify',          require('./htmlify-filter'));
app.filter('numsmall',         require('./numsmall-filter'));
app.filter('trustresourceurl', require('./trust-resource-url-filter'));

app.animation('.slide-animation', require('./slide-animation'));

module.exports = app;
