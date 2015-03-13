'use strict';

require(['purl', 'card-handler'], function(purl, cardHandler) {
    var card = cardHandler('body');
    card(purl(document.URL).param('content'));
});
