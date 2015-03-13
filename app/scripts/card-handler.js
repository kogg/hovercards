'use strict';

define(['jquery'], function($) {
    return function cardHandler(body) {
        if (!body) {
            body = 'body';
        }
        body = $(body);

        var lastCardObj = null;
        var handler = { handled: [] };

        function handleCard() {
            var nextCall = [];
            Array.prototype.slice.call(arguments).forEach(function(content) {
                if (handler.handled.length >= 5 || $.inArray(content, handler.handled) !== -1) {
                    return;
                }
                handler.handled.push(content);
                var cardObj = body.find('#' + content + '-card');
                if (lastCardObj) {
                    cardObj.insertAfter(lastCardObj);
                } else {
                    cardObj.prependTo(body);
                }
                lastCardObj = cardObj;
                cardObj.show();
                var more = cardObj.data('more');
                if (more) {
                    nextCall = nextCall.concat(more);
                }
            });
            if (nextCall.length) {
                handler.handleCard.apply(handler, nextCall);
            }
        }

        handler.handleCard = handleCard;

        return handler;
    };
});
