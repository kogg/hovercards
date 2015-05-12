var angular = require('angular');

module.exports = angular.module(chrome.i18n.getMessage('app_short_name') + 'ServiceComponents', [])
    .factory('apiService', ['$q', function($q) {
        function call_background(params, deferred, object) {
            chrome.runtime.sendMessage(params, function(response) {
                if (!response) {
                    return deferred.reject();
                }
                if (response[0]) {
                    return deferred.reject(response[0]);
                }
                if (object) {
                    angular.extend(object, response[1]);
                }
                return deferred.resolve(response[1]);
            });
        }

        return { get: function(params, success, failure) {
            var object = {};
            var deferred = $q.defer();
            if (!params.api && params.type === 'url') {
                var promises = [];
                [{ api: 'reddit', type: 'url', id: params.id }].forEach(function(request) {
                    var d = $q.defer();
                    promises.push(d.promise.then(function(result) {
                        deferred.notify(result);
                    }));
                    call_background(request, d);
                    $q.all(promises).then(function(result) {
                        deferred.resolve(result);
                    }, function(err) {
                        deferred.reject(err);
                    });
                });
            } else {
                call_background(params, deferred, object);
            }
            object.$resolved = false;
            object.$promise = deferred.promise
                .then(success, failure)
                .finally(function() {
                    object.$resolved = true;
                });

            return object;
        } };
    }])
    .name;
