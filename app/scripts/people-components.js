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
                        // Get IDs from account
                        var connected_accounts_ids = (account.connected || []).map(function(account) {
                            return account.type + '/' + account.id;
                        });
                        connected_accounts_ids.push(account.type + '/' + account.id);

                        // Find all people who have those IDs
                        var people_to_merge = [];
                        people.forEach(function(person) {
                            var isConnected = connected_accounts_ids.some(function(account_id) {
                                return person.connected_accounts_ids[account_id];
                            });
                            if (!isConnected) {
                                return;
                            }
                            people_to_merge.push(person);
                        });

                        // Make, merge, or get our person
                        var person = people_to_merge[0];
                        for (var i = 1; i < people_to_merge.length; i++) {
                            var other_person = people_to_merge[i];
                            person.accounts = person.accounts.concat(other_person.accounts);
                            for (var account_id in other_person.connected_accounts_ids) {
                                person.connected_accounts_ids[account_id] = true;
                            }
                            people.splice(people.indexOf(other_person), 1);
                        }
                        if (!person) {
                            person = { accounts: [], connected_accounts_ids: { } };
                            people.push(person);
                        }

                        // Give the person our account and the IDs
                        person.accounts.push(account);
                        connected_accounts_ids.forEach(function(account_id) {
                            person.connected_accounts_ids[account_id] = true;
                        });
                        person.selectedAccount = person.selectedAccount || account;
                        deferred.notify(person);
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
