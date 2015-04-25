var $ = require('jquery');

module.exports = function() {
    return {
        scope: {
            requests: '=',
            discussions: '=',
            selectedIndex: '='
        },
        link: function($scope) {
            var aborts = [];
            $scope.$watch('requests', function(requests) {
                $scope.selectedIndex = -1;
                $scope.discussions = null;
                aborts.forEach(function(abort) {
                    abort();
                });
                aborts = [];
                if (!requests) {
                    return;
                }
                $scope.selectedIndex = 0;
                $scope.discussions = [];
            });

            $scope.$watch('selectedIndex', function(selectedIndex) {
                if (selectedIndex === -1 || !$scope.requests) {
                    return;
                }
                if ($scope.discussions[selectedIndex]) {
                    return;
                }
                var request = $scope.requests[selectedIndex];
                $.get('https://hovercards.herokuapp.com/v1/' + request.type + '/' + request.id)
                    .done(function(data) {
                        $scope.$apply(function() {
                            $scope.discussions[selectedIndex] = data;
                        });
                    });
            });
        }
    };
};
