var angular = require('angular');

var EXTENSION_ID = chrome.i18n.getMessage('@@extension_id');

module.exports = angular.module(chrome.i18n.getMessage('app_short_name') + 'ViewComponents', [])
    .controller('ViewController', ['$scope', '$document', '$window', function($scope, $document, $window) {
        $scope.view = { at: {} };

        $scope.$watch('!!view.fullscreen', function(fullscreen, oldFullscreen) {
            if (fullscreen === oldFullscreen) {
                return;
            }
            $window.top.postMessage({ msg: EXTENSION_ID + '-fullscreen', value: fullscreen }, '*');
        });

        $window.addEventListener('message', function(event) {
            var request = event.data;
            switch(request.msg) {
                case EXTENSION_ID + '-Esc':
                    if ($scope.view.fullscreen) {
                        $scope.$apply(function() {
                            $scope.view.fullscreen = false;
                        });
                        return;
                    }
                    $window.top.postMessage({ msg: EXTENSION_ID + '-hide', by: 'Esc' }, '*');
                    break;
            }
        }, false);
    }])
    .name;

