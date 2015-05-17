var angular = require('angular');

module.exports = angular.module(chrome.i18n.getMessage('app_short_name') + 'ServiceComponents', [])
    .factory('apiService', ['$q', function($q) {
        var errors = { 0: 'our-problem', 400: 'bad-input', 401: 'unauthorized', 404: 'no-content', 502: 'dependency-down' };

        var service = {
            loading: [],
            get: function(params) {
                var object = {
                    $resolved: false,
                    $promise:
                        $q(function(resolve, reject) {
                            chrome.runtime.sendMessage(params, function(response) {
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
                            return obj;
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
    .name;
