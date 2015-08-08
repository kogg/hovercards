require('jquery');
var angular = require('angular');

var EXTENSION_ID = chrome.i18n.getMessage('@@extension_id');

angular.bootstrap(document, [angular.module('app', [// Dependencies
                                                    require('angular-animate'),

                                                    // Application Components
                                                    require('./hovercard-components'),
                                                    require('./common-components'),

                                                    // Data Related Components
                                                    require('./content-components'),
]).name]);

window.parent.postMessage({ msg: EXTENSION_ID + '-hovercard-ready' }, '*');
