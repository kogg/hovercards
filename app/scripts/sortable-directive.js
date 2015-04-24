require('./jquery-ui.min'); // FIXME

module.exports = function() {
    return {
        restrict: 'A',
        link: function($scope, $element) {
            $element.sortable({ placeholder: 'ui-state-highlight' });
            $element.disableSelection();
        }
    };
};
