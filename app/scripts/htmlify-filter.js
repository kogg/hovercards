module.exports = ['$filter', function($filter) {
    return function(content) {
        return $filter('linky')(content, '_blank').replace(/(&#10;|\n)/g, '<br>');
    };
}];
