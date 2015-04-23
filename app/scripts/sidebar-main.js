//var angular = require('angular');

var click_trigger     = require('./click-trigger');
var longpress_trigger = require('./longpress-trigger');

click_trigger('body', 'a[data-load]', function(link) {
    return link.data('load');
});

longpress_trigger.on('body', 'a[data-load]', function(link) {
    return link.data('load');
});

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
