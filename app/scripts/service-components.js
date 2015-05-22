var angular = require('angular');

module.exports = angular.module(chrome.i18n.getMessage('app_short_name') + 'ServiceComponents', [])
    .factory('apiService', ['$timeout', '$q', function($timeout, $q) {
        var errors = { 0: 'our-problem', 400: 'bad-input', 401: 'unauthorized', 404: 'no-content', 502: 'dependency-down' };

        var service = {
            loading: [],
            get: function(params) {
                var object = {
                    $promise:
                        $q(function(resolve, reject) {
                            var timeout = $timeout(function() {
                                object.$err = { 'still-waiting': true };
                            }, 5000);
                            chrome.runtime.sendMessage(params, function(response) {
                                $timeout.cancel(timeout);
                                object.$err = null;
                                if (!response) {
                                    return reject({ 'our-problem': true });
                                }
                                if (response[0]) {
                                    response[0][errors[response[0].status] || errors[0]] = true;
                                    return reject(response[0]);
                                }
                                return resolve(response[1]);
                            });
                        })
                        .then(function(obj) {
                            angular.extend(object, obj);
                            return object;
                        }, function(err) {
                            object.$err = err;
                            return $q.reject(err);
                        })
                        .finally(function() {
                            object.$resolved = true;
                            var i = service.loading.indexOf(object);
                            if (i !== -1) {
                                service.loading.splice(i, 1);
                            }
                        })
                };
                service.loading.push(object);

                return object;
            }
        };

        return service;
    }])
    .directive('authorize', ['apiService', function(apiService) {
        return {
            restrict: 'A',
            scope: {
                api: '=authorize',
                onAuthorized: '&'
            },
            link: function($scope, $element) {
                var handler = angular.noop;
                $scope.$watch('api', function(api) {
                    $element.unbind('click', handler);
                    if (!api) {
                        return;
                    }
                    $element.click(handler = function() {
                        $element.unbind('click', handler);
                        apiService.get({ api: api, type: 'auth' })
                            .$promise
                            .then(function() {
                                $scope.onAuthorized();
                            })
                            .catch(function() {
                                if ($scope.api !== api) {
                                    return;
                                }
                                $element.click(handler);
                            });
                    });
                });
            }
        };
    }])
    .directive('loading', ['apiService', function(apiService) {
        return {
            restrict: 'A',
            scope: {
                loading: '='
            },
            link: function($scope) {
                $scope.promises = apiService.loading;
                $scope.$watch('!!promises.length', function(loading) {
                    $scope.loading = loading;
                });
            }
        };
    }])
    .name;
