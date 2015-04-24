require('jquery');
var angular = require('angular');

angular.bootstrap(document, [require('./angular-app').name]);

chrome.runtime.sendMessage({ msg: 'ready' });

/*
require(['account-directive',
         'content-directive',
         'discussions-directive',
         'entry-directive',
         'error-directive',
         'more-content-directive',
         'people-directive',
         'readmore-directive',
         'sortable-directive',
         'youtube-channel-subscribe-directive',
         'copy-filter',
         'htmlify-filter',
         'numsmall-filter',
         'trust-resource-url-filter',
         'slide-animation'], function() {
    angular.bootstrap(document, ['app']);

    require(['domReady!'], function() {
        chrome.runtime.sendMessage({ msg: 'ready' });
    });
});
*/
