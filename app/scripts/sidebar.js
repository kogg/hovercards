'use strict';

define('sidebar', ['jquery'], function($) {
    function putInElement(element) {
        var sidebarObj = $('<div class="deckard-sidebar"></div>');

        $(element).prepend(sidebarObj);

        sidebarObj.append($('<iframe frameborder="0"></iframe>').prop('src', chrome.extension.getURL('sidebar.html')));

        return sidebarObj;
    }

    return { putInElement: putInElement };
});
