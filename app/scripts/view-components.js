var angular      = require('angular');

var EXTENSION_ID = chrome.i18n.getMessage('@@extension_id');

module.exports = angular.module(chrome.i18n.getMessage('app_short_name') + 'ViewComponents', [])
    .controller('ViewController', ['$scope', '$document', '$window', function($scope, $document, $window) {
        $scope.view = { at: {} };

        angular.element($document).keydown(function(e) {
            if (e.which !== 27 || !$scope.view.fullscreen) {
                return;
            }
            e.stopImmediatePropagation();
            $scope.$apply(function() {
                $scope.view.fullscreen = false;
            });
        });

        $scope.$watch('!!view.fullscreen', function(fullscreen, oldFullscreen) {
            if (fullscreen === oldFullscreen) {
                return;
            }
            $window.top.postMessage({ msg: EXTENSION_ID + '-fullscreen', value: fullscreen }, '*');
        });
    }])
    .name;

