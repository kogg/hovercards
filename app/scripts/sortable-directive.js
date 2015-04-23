'use strict';

define('sortable-directive', ['angular-app', 'jquery-ui'], function(app) {
    app.directive('sortable', function() {
        return {
            restrict: 'A',
            link: function($scope, $element) {
                $element.sortable({ placeholder: "ui-state-highlight" });
                $element.disableSelection();
            }
        };
    });
});
