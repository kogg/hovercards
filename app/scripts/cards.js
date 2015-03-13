'use strict';

define(['jquery'], function($) {
    return function cards(body) {
        if (!body) {
            body = 'body';
        }
        body = $(body);

        var lastCardObj = null;

        return function card(content) {
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
