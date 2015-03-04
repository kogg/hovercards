'use strict';

/* exported sidebar */
var sidebar = (function() {
    function putInArea(area) {
        var sidebarObj = $('<div class="deckard-sidebar"></div>');

        $(area).prepend(sidebarObj);

        return sidebarObj;
    }

    return { putInArea: putInArea };
}());
