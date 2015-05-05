require('jquery');
var angular = require('angular');

var app = angular.module('app', [require('angular-animate'),
                                 require('angular-inview/angular-inview') && 'angular-inview',
                                 require('./entry-components'),
                                 require('./content-components'),
                                 require('./discussion-components'),
                                 require('./people-components'),
                                 require('./more-content-components'),
                                 require('./common-components'),

                                 require('./reddit-components'),
                                 require('./youtube-components')]);

app.directive('error', require('./error-directive'));

module.exports = app;
