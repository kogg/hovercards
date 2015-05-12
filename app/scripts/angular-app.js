require('jquery');
var angular = require('angular');

module.exports = angular.module('app', [// Dependencies
                                        require('angular-animate'),
                                        require('angular-inview/angular-inview') && 'angular-inview',
                                        require('angular-messages'),

                                        // Our Components
                                        require('./entry-components'),
                                        require('./content-components'),
                                        require('./discussion-components'),
                                        require('./people-components'),
                                        require('./more-content-components'),
                                        require('./common-components'),

                                        // API Specific Components
                                        require('./reddit-components'),
                                        require('./youtube-components')]);
