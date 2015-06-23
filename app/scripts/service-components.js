var _       = require('underscore');
var angular = require('angular');

module.exports = angular.module(chrome.i18n.getMessage('app_short_name') + 'ServiceComponents', [])
    .factory('apiService', ['$q', function($q) {
        var errors = { 0:   'our-problem',
                       400: 'bad-input',
                       401: 'unauthorized',
                       403: 'forbidden',
                       404: 'no-content',
                       501: 'not-implemented',
                       502: 'dependency-down' };
        var api_specific_errors = { 'dependency-down': true,
                                    'forbidden':       true,
                                    'not-implemented': true,
                                    'unauthorized':    true };

        var service = {
            loading: [],
            get: function(params, object) {
                object = object || {};
                object.$promise = $q(function(resolve, reject) {
                    chrome.runtime.sendMessage({ type: 'service', request: params }, function(response) {
                        if (!response) {
                            return reject({ 'our-problem': true });
                        }
                        if (response[0]) {
                            var error_type = errors[response[0].status] || errors[0];
                            response[0][error_type] = true;
                            response[0].api = api_specific_errors[error_type] && params.api;
                            return reject(response[0]);
                        }
                        return resolve(response[1]);
                    });
                })
                .then(function(obj) {
                    angular.extend(object, obj);
                    if ((params.type in { discussion: true, url: true } && (!object.comments || !object.comments.length)) ||
                        (params.type === 'more_content'                 && (!object.content  || !object.content.length))) {
                        object.$err = { 'empty-content': true,
                                        api:             params.api,
                                        reload:          function() {
                                            service.get(params, object);
                                        } };
                        return $q.reject(object.$err);
                    }
                    return object;
                }, function(err) {
                    object.$err = _.extend(err, { api:    params.api,
                                                  reload: function() {
                                                      service.get(params, object);
                                                  } });
                    return $q.reject(object.$err);
                })
                .finally(function() {
                    object.$resolved = true;
                    service.loading = _.without(service.loading, object);
                });
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
    .name;
