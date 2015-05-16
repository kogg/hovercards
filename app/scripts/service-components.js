var angular = require('angular');

module.exports = angular.module(chrome.i18n.getMessage('app_short_name') + 'ServiceComponents', [])
    .factory('apiService', ['$q', function($q) {
        var errors = { 0: 'our-problem', 400: 'bad-input', 404: 'no-content', 502: 'dependency-down' };

        return { get: function(params, success, failure) {
            var deferred = $q.defer();
            var object = {
                $resolved: false,
                $promise: deferred.promise
                    .then(success, failure)
                    .finally(function() {
                        object.$resolved = true;
                    })
            };

            chrome.runtime.sendMessage(params, function(response) {
                if (!response) {
                    return deferred.reject();
                }
                if (response[0]) {
                    response[0][errors[response[0].status] || errors[0]] = true;
                    return deferred.reject(response[0]);
                }
                angular.extend(object, response[1]);
                return deferred.resolve(response[1]);
            });

            return object;
        } };
    }])
    .name;
