'use strict';

require(['purl', 'cards-controller'], function(purl) {
    angular.bootstrap(document, ['app']);
    var purled = purl(document.URL);
    var scope = angular.element(document.getElementById('cards')).scope();
    scope.$apply(function() {
        scope.addCard({ content: purled.param('content'),
                        id:      purled.param('id') });
    });
});
