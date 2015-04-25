require('jquery');
var angular = require('angular');

var app = angular.module('app', [require('angular-animate'),
                                 require('angular-inview/angular-inview') && 'angular-inview',
                                 require('./entry-components'),
                                 require('./content-components'),
                                 require('./discussion-components'),
                                 require('./people-components'),
                                 require('./more-content-components'),
                                 require('./common-components')]);

app.directive('error',                   require('./error-directive'));
app.directive('readmore',                require('./readmore-directive'));
app.directive('sortable',                require('./sortable-directive'));
app.directive('youtubeChannelSubscribe', require('./youtube-channel-subscribe-directive'));

app.animation('.slide-animation', require('./slide-animation'));

module.exports = app;
