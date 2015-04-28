var common = require('./common');

module.exports = angular.module('hovercardsEntryComponents', [])
    .controller('EntryController', ['$scope', function($scope) {
        window.addEventListener('message', function(event) {
            var request = event.data;
            switch(request.msg) {
                case 'load':
                    $scope.$apply(function() {
                        $scope.entry = null;
                    });
                    setTimeout(function() {
                        $scope.$apply(function() {
                            $scope.entry = common.identify_url(request.url);
                        });
                    }, 100);
                    break;
                case 'hide':
                    $scope.$apply(function() {
                        $scope.entry = null;
                    });
                    break;
            }
        }, false);
    }])
    .name;
