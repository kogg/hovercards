'use strict';

define(['angular-app'], function(app) {
    app.filter('numsmall', function() {
        return function(number) {
            return number;
        };
    });
});
