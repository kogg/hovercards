'use strict';

require(['purl', 'card-handler'], function(purl, cardHandler) {
    var handleCard = cardHandler('body');
    handleCard(purl(document.URL).param('content'));
});
