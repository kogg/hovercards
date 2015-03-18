'use strict';

define(['angular-app'], function(app) {
    app.filter('numsmall', function() {
        var suffix = ['', 'k', 'm', 'b'];
        return function(number) {
            var i = 0;
            while (1000 <= number) {
                number /= 1000;
                i++;
            }
            return Math.floor(number) + suffix[i];
        };
    });
});
