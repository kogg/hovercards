var angular = require('angular');

module.exports = angular.module(chrome.i18n.getMessage('app_short_name') + 'ServiceComponents', [require('angular-resource')])
    .factory('serverService', ['$resource', 'clientService', function($resource, clientService) {
        var resource = $resource('https://' + chrome.i18n.getMessage('app_short_name') + '.herokuapp.com/v1/:api/:type');
        // var resource = $resource('http://localhost:5000/v1/:api/:type');

        return { get: function(params, success, failure) {
            if (!clientService.is_client(params.api)) {
                return resource.get(params, success, failure);
            }

            return clientService.get(params, success, failure);
        } };
    }])
    .factory('clientService', ['$q', function($q) {
        var client_calls = { reddit: require('YoCardsAPICalls/reddit')({ key: 'fNtoQI4_wDq21w' }) };

        return {
            is_client: function(api) {
                return !!client_calls[api];
            },
            get: function(params, success, failure) {
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
            }
        };
    }])
    .name;
