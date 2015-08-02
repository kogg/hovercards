var $ = require('jquery');

var common       = require('./common');
var network_urls = require('YoCardsApiCalls/network-urls');

var MOUSEMOVE = 'mousemove mouseenter';

var obj_busy_with;

module.exports = function(selector, get_url) {
    $('html').on(MOUSEMOVE, selector, function() {
        var obj = $(this);
        var url;
        if ((obj_busy_with && (obj.is(obj_busy_with) || obj.has(obj_busy_with).length)) || !(url = common.massage_url(get_url(obj))) || !network_urls.identify(url)) {
            return;
        }
        if (obj_busy_with) {
            console.log('TODO Cleanup hovercard with', obj_busy_with);
        }
        obj_busy_with = obj;
        console.log('I\'m here', url);
    });
};
