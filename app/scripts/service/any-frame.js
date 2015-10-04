var $            = require('jquery');
var network_urls = require('hovercardsshared/apis/network-urls');

$.service = function(identity, callback) {
    if (typeof identity === 'string') {
        identity = network_urls.identify(identity);
    }
    if (!identity) {
        return;
    }
    // FIXME This is a stub
    setTimeout(function() {
        callback(null, { some: 'thing' });
    }, 500 + 500 * Math.random());
};
