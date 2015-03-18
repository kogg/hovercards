'use strict';

define(['angular-app'], function(app) {
    app.filter('description', ['$filter', function($filter) {
        return function(description) {
            return $filter('linky')(description, '_blank').replace(/(&#10;|\n)/g, '<br>');
        };
    }]);
});
