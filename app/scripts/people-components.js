var angular = require('angular');
var oboe = require('oboe');

module.exports = angular.module('hovercardsPeopleComponents', [require('angular-resource')])
    .controller('PeopleController', ['$scope', 'peopleService', function($scope, peopleService) {
        $scope.$watch('entry.accounts', function(requests) {
            $scope.entry.selectedPerson = null;
            if (!requests) {
                $scope.people = null;
                return null;
            }

            $scope.entry.loading = ($scope.entry.loading || 0) + 1;
            $scope.people = (function() {
                var people = peopleService.get(requests);
                people.$promise
                    .then(null, null, function(person) {
                        $scope.entry.selectedPerson = $scope.entry.selectedPerson || person;
                    })
                    .catch(function(err) {
                        $scope.people.$err = err;
                    })
                    .finally(function() {
                        $scope.entry.loading--;
                    });

                return people;
            }());
        });
    }])
    .factory('peopleService', ['$q', function($q) {
        return { get: function(requests, success, failure) {
            var people = [];
            var deferred = $q.defer();

            var aborts = [];
            requests.forEach(function(request) {
                aborts.push(oboe('https://hovercards.herokuapp.com/v1/' + request.type + '/' + request.id)
                    .node('!.{type id}', function(account) {
                        people.push({ accounts: [account], connected_accounts_ids: { }, selectedAccount: account });
                        deferred.notify(people[people.length - 1]);
                    })
                    .done(function() {
                        deferred.resolve(people);
                    })
                    .fail(function() {
                        deferred.reject();
                    })
                    .abort);
            });

            people.$resolved = false;
            people.$promise = deferred.promise;
            people.$promise.then(success, failure);
            people.$promise
                .finally(function() {
                    people.$resolved = true;
                    aborts.forEach(function(abort) {
                        abort();
                    });
                });

            return people;
        } };
    }])
    .name;
