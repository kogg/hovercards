var oboe = require('oboe');

module.exports = function() {
    return {
        scope: {
            requests: '=',
            people: '=',
            selectedIndex: '='
        },
        link: function($scope) {
            var aborts = [];
            $scope.$watch('requests', function(requests) {
                $scope.selectedIndex = -1;
                $scope.people = null;
                aborts.forEach(function(abort) {
                    abort();
                });
                aborts = [];
                if (!requests) {
                    return;
                }
                $scope.people = [];
                requests.forEach(function(request) {
                    aborts.push(oboe('https://hovercards.herokuapp.com/v1/' + request.type + '/' + request.id)
                        .node('!.{type id}', function(account) {
                            $scope.$apply(function() {
                                // Get IDs from account
                                var connected_accounts_ids = (account.connected || []).map(function(account) {
                                    return account.type + '/' + account.id;
                                });
                                connected_accounts_ids.push(account.type + '/' + account.id);

                                // Find all people who have those IDs
                                var people_to_merge = [];
                                $scope.people.forEach(function(person) {
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
                                    $scope.people.splice($scope.people.indexOf(other_person), 1);
                                }
                                if (!person) {
                                    person = { accounts: [], connected_accounts_ids: { } };
                                    $scope.people.push(person);
                                    if ($scope.selectedIndex === -1) {
                                        $scope.selectedIndex = 0;
                                    }
                                }

                                // Give the person our account and the IDs
                                person.accounts.push(account);
                                connected_accounts_ids.forEach(function(account_id) {
                                    person.connected_accounts_ids[account_id] = true;
                                });
                                person.selectedAccount = person.selectedAccount || account;
                            });
                        })
                        .abort);
                });
            });
        }
    };
};
