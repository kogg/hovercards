'use strict';

define('sidebar', ['jquery'], function($) {
    return function sidebar() {
        return $('<div class="deckard-sidebar"></div>').append($('<iframe frameborder="0"></iframe>').prop('src', chrome.extension.getURL('sidebar.html')));
    };
});
