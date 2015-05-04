var angular = require('angular');

module.exports = angular.module(chrome.i18n.getMessage('app_short_name') + 'ServiceComponents', [])
    .factory('apiService', ['$q', function($q) {
        return { get: function(params, success, failure) {
            var object = {};
            var deferred = $q.defer();
            object.$resolved = false;
            object.$promise = deferred.promise
                .then(success, failure)
                .finally(function() {
                    object.$resolved = true;
                });

            chrome.runtime.sendMessage(params, function(response) {
                if (!response) {
                    return deferred.reject();
                }
                if (response[0]) {
                    return deferred.reject(response[0]);
                }
                angular.extend(object, response[1]);
                return deferred.resolve(response[1]);
            });

            return object;
        } };
    }])
    .name;
