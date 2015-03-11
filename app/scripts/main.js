'use strict';

require(['sidebar'], function(sidebar) {
    sidebar().appendTo('body');
});
require(['youtube'], function(youtube) {
    youtube.inject('body');
});
