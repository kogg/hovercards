var $       = require('jquery');
var angular = require('angular');

angular.bootstrap(document, [require('./angular-app').name]);

window.top.postMessage({ msg: 'ready' }, '*');

$('body').on('mousedown', 'a[href]', function() {
    $(this).attr('target', '_blank');
});
