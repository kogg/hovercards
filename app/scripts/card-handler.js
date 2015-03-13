'use strict';

define(['jquery'], function($) {
    return function cardHandler(body) {
        if (!body) {
            body = 'body';
        }
        body = $(body);

        var lastCardObj = null;
        var callCount = 0;

        return function card(content) {
            if (callCount++ >= 5) {
                return;
            }
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
                more.forEach(card);
            }
        };
    };
});
