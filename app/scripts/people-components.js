var angular = require('angular');

module.exports = angular.module(chrome.i18n.getMessage('app_short_name') + 'PeopleComponents', [require('./service-components')])
    .controller('PeopleController', ['$scope', '$q', 'apiService', function($scope, $q, apiService) {
        $scope.$watchCollection('entry.accounts', function(requests) {
            $scope.entry.selectedPerson = null;
            if (!requests) {
                $scope.data.people = null;
                return;
            }

            $scope.data.loading = ($scope.data.loading || 0) + 1;
            $scope.data.people = (function() {
                var people = [];
                var done_account_ids = {};
                people.$resolved = false;
                people.$promise = $q.all(requests.map(function get_account(request) {
                    var account = apiService.get(request);
                    return account.$promise.then(function(account) {
                        // Get IDs from account
                        var connected_accounts_ids = (account.connected || []).map(function(account) {
                            return [account.api, account.type, account.id].join('/');
                        });
                        var account_id = [account.api, account.type, account.id].join('/');
                        connected_accounts_ids.push(account_id);
                        done_account_ids[account_id] = true;

                        // Find all people who have those IDs
                        var people_to_merge = [];
                        people.forEach(function(person) {
                            if (!connected_accounts_ids.some(function(account_id) { return person.connected_accounts_ids[account_id]; })) {
                                return;
                            }
                            people_to_merge.push(person);
                        });

                        // Make, merge, or get our person
                        var person = people_to_merge[0];
                        for (var i = 1; i < people_to_merge.length; i++) {
                            var other_person = people_to_merge[i];
                            person.accounts = person.accounts.concat(other_person.accounts);
                            angular.extend(person.connected_accounts_ids, other_person.connected_accounts_ids);
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
                        if ($scope.data.people === people) {
                            $scope.entry.selectedPerson = $scope.entry.selectedPerson || person;
                        }

                        return $q.all((account.connected || []).filter(function(account) {
                            return done_account_ids[[account.api, account.type, account.id].join('/')];
                        }).map(get_account));
                    });
                }))
                .catch(function(err) {
                    people.$err = err;
                })
                .finally(function() {
                    people.$resolved = true;
                    $scope.data.loading--;
                });
                return people;
            }());
        });
    }])
    .name;
