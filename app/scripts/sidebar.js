'use strict';

/* exported sidebar */
var sidebar = (function() {
    function putInElement(element) {
        var sidebarObj = $('<div class="deckard-sidebar"></div>');

        $(element).prepend(sidebarObj);

        sidebarObj.append($('<iframe></iframe>').prop('src', chrome.extension.getURL('sidebar.html')));

        return sidebarObj;
    }

    return { putInElement: putInElement };
}());
