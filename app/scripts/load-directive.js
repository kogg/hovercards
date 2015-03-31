'use strict';

define('load-directive', ['angular-app'], function(app) {
    app.directive('load', function() {
        return {
            scope: {
                provider: '@',
                content:  '@',
                id:       '=',
                object:   '=',
                err:      '='
            },
            link: function($scope) {
                var removeWatch = $scope.$watch('id', function(id) {
                    if (!id) {
                        return;
                    }
                    chrome.runtime.sendMessage({ msg: 'data', provider: $scope.provider, content: $scope.content, id: id }, function(object) {
                        $scope.$apply(function() {
                            if (object.err) {
                                $scope.err = object.err;
                                return;
                            }
                            $scope.object = object;
                        });
                    });
                    removeWatch();
                });
            }
        };
    });
});
