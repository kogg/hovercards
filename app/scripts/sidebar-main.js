require('jquery');
var angular = require('angular');

angular.bootstrap(document, [require('./angular-app').name]);

chrome.runtime.sendMessage({ msg: 'ready' });
