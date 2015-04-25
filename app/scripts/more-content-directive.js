var $ = require('jquery');

module.exports = function() {
    return {
        scope: {
            request:     '=',
            moreContent: '='
        },
        link: function($scope) {
            $scope.$watch('request', function(request) {
                $scope.moreContent = null;
                if (!request) {
                    return;
                }
                $.get('https://hovercards.herokuapp.com/v1/' + request.type + '/' + request.id + '/content')
                    .done(function(data) {
                        $scope.$apply(function() {
                            $scope.moreContent = data;
                        });
                    });
            });
        }
    };
};
