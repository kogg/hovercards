'use strict';

require(['purl', 'cards'], function(purl, cards) {
    var card = cards('body');
    card(purl(document.URL).param('content'));
});
