require('jquery');
var angular = require('angular');

angular.bootstrap(document, [require('./angular-app').name]);

window.top.postMessage({ msg: 'ready' }, '*');
