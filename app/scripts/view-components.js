var angular      = require('angular');

var extension_id = chrome.i18n.getMessage('@@extension_id');

module.exports = angular.module(chrome.i18n.getMessage('app_short_name') + 'ViewComponents', [])
    .controller('ViewController', ['$scope', function($scope) {
        $scope.view = { at: {} };

        /* fullscreen logic */
        $scope.view.fullscreen = false;
        angular.element(document).keydown(function(e) {
            if (e.which !== 27 || !$scope.view.fullscreen) {
                return;
            }
            e.stopImmediatePropagation();
            $scope.$apply(function() {
                $scope.view.fullscreen = false;
            });
        });

        $scope.$watch('view.fullscreen', function(fullscreen, oldFullscreen) {
            if (fullscreen === oldFullscreen) {
                return;
            }
            window.top.postMessage({ msg: extension_id + '-fullscreen', value: fullscreen }, '*');
        });
    }])
    .name;

