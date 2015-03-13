'use strict';

require(['purl', 'card-handler'], function(purl, cardHandler) {
    var handler = cardHandler('body');
    handler.handleCard(purl(document.URL).param('content'));
});
