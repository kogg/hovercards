'use strict';

/* exported sidebar */
var sidebar = (function() {
    function putInElement(element) {
        var sidebarObj = $('<div class="deckard-sidebar"></div>');

        $(element).prepend(sidebarObj);

        return sidebarObj;
    }

    return { putInElement: putInElement };
}());
