'use strict';

define(['jquery'], function($) {
    return function cardHandler(body) {
        if (!body) {
            body = 'body';
        }
        body = $(body);

        var lastCardObj = null;
        var handler = { handled: [] };

        function handleCard(content) {
            if (handler.handled.length >= 5) {
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
                more.forEach(handler.handleCard);
            }
        }

        handler.handleCard = handleCard;

        return handler;
    };
});
