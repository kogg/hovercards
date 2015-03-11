'use strict';

require(['jquery', 'sidebar'], function($, sidebar) {
    sidebar().appendTo('body');
});
require(['youtube'], function(youtube) {
    youtube.inject('body');
});
