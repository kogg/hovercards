'use strict';

define(['angular-app'], function(app) {
    app.animation('.slide-animation', function() {
        return {
            beforeAddClass: function(element, className, done) {
                if (className !== 'ng-hide') {
                    return done();
                }
                element.slideUp(500, done);
            },
            removeClass: function(element, className, done) {
                if (className !== 'ng-hide') {
                    return done();
                }
                element.slideDown(500, done);
            }
        };
    });
});
