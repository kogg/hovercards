var $      = require('jquery');
var common = require('./common');

function longpress_handler(e) {
    var obj = $(e.target || this);
    var initialPointerEvents = obj.css('pointer-events');
    var initialCursor = obj.css('cursor');
    obj.css('pointer-events', 'none');
    obj.css('cursor', 'default');

    var interval = setInterval(function() {
        if (common.is_active(obj)) {
            return;
        }

        clearInterval(interval);
        obj.off('click.longpress_longpress');
        obj.css('pointer-events', initialPointerEvents);
        obj.css('cursor', initialCursor);
    }, 100);
    obj.one('click.longpress_longpress', function(e) {
        if (e.which !== 1) {
            return;
        }

        e.preventDefault();
        e.stopImmediatePropagation();
    });
}

module.exports = function(body, selector, get_url) {
    body = $(body);

    body.on('mousedown', selector, function(e) {
        if (e.which !== 1) {
            return;
        }
        var obj = $(this);
        var url = get_url(obj);
        if (!url) {
            return;
        }
        var timeout = setTimeout(function() {
            obj.off('click.longpress_mousedown');
            obj.off('mouseleave.longpress_mousedown');
            obj.off('mousemove.longpress_mousedown');
            obj.trigger('longpress', [url]);
        }, 333);
        obj.one('click.longpress_mousedown', function(e) {
            if (e.which !== 1) {
                return;
            }
            clearTimeout(timeout);
        });
        obj.one('mouseleave.longpress_mousedown', function() {
            clearTimeout(timeout);
        });
        obj.one('mousemove.longpress_mousedown', function() {
            clearTimeout(timeout);
        });
    });

    var longpress_events = (($._data(body.get(0), 'events') || {}).longpress || []);

    if (!longpress_events.some(function(event_handler) { return event_handler.handler === longpress_handler; })) {
        body.on('longpress', longpress_handler);
    }
};
