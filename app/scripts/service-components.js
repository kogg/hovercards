var angular = require('angular');

module.exports = angular.module(chrome.i18n.getMessage('app_short_name') + 'ServiceComponents', [require('angular-resource')])
    .factory('serverService', ['$resource', '$q', function($resource, $q) {
        var resource = $resource('https://' + chrome.i18n.getMessage('app_short_name') + '.herokuapp.com/v1/:api/:type');
        var client_calls = { };

        return { get: function(params, success, failure) {
            if (!client_calls[params.api]) {
                return resource.get(params, success, failure);
            }

            var object = {};
            var deferred = $q.defer();
            object.$resolved = false;
            object.$promise = deferred.promise
                .then(success, failure)
                .finally(function() {
                    object.$resolved = true;
                });

            client_calls[params.api][params.type](params, function(err, result) {
                if (err) {
                    return deferred.reject(err);
                }
                angular.extend(object, result);
                deferred.resolve(result);
            });

            return object;
        } };
    }])
    .name;
