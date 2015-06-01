var angular = require('angular');
require('slick-carousel');

module.exports = angular.module(chrome.i18n.getMessage('app_short_name') + 'PeopleComponents', [require('./service-components')])
    .controller('PeopleController', ['$scope', '$interval', '$timeout', '$q', 'apiService', function($scope, $interval, $timeout, $q, apiService) {
        var others_exist_watcher = $scope.$watch('entry.type', function(type) {
            if (!type) {
                return;
            }
            others_exist_watcher();
            if (type === 'account') {
                $scope.can_have_people = true;
                return;
            }

            /* check to see if all the things we want to load are out of our way. Also, give them time to animate or whatever */
            var other_things_loaded_watcher = $scope.$watch('data.content.$resolved && data.discussion.$resolved', function(other_things_loaded) {
                if (!other_things_loaded) {
                    return;
                }
                other_things_loaded_watcher();

                $timeout(function() {
                    angular.element(window).scroll();

                    var interval = $interval(function() {
                        angular.element(window).scroll();
                    }, 100);

                    /* Check to see if we hit the bottom once we've waited for everything and forced a scroll */
                    var can_have_people_watcher = $scope.$watch('view.at.people', function(value) {
                        if (!value) {
                            return;
                        }
                        $interval.cancel(interval);
                        can_have_people_watcher();

                        $scope.can_have_people = true;
                    });
                }, 300);
            });
        });

        function request_to_string(request) {
            return [request.api, request.type, request.id].join('/');
        }

        function load_account_into(request, accounts) {
            var key = request_to_string(request);
            if (accounts[key]) {
                return;
            }
            accounts[key] = apiService.get(request);
            accounts[key]
                .$promise
                .then(function(account) {
                    if (!account.connected) {
                        return;
                    }
                    account.connected.forEach(function(request) {
                        load_account_into(request, accounts);
                    });
                });
        }

        $scope.$watchCollection('can_have_people && entry.accounts', function(requests) {
            if (!requests || !requests.length) {
                $scope.data.people = null;
                return;
            }

            $scope.data.accounts = (function(accounts) {
                requests.forEach(function(request) {
                    load_account_into(request, accounts);
                });

                return accounts;
            }($scope.data.accounts || {}));
        });

        /*
        $scope.$watchCollection('can_have_people && entry.accounts', function(requests) {
            if (!requests || !requests.length) {
                $scope.data.people = null;
                return;
            }

            $scope.data.people = (function() {
                var people = [];
                var done_account_ids = {};
                people.$resolved = false;

                var add_to_people = function(account) {
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
                };

                var timeout = $timeout(function() {
                    // HACKY SHIM SHAM
                    people.$err = { 'still-waiting': true, 'api-specific': true, api: ((requests.length === 1) && requests[0].api) || null };
                }, 5000);

                people.$promise = $q.all(requests.map(function get_account(request) {
                    var account = apiService.get(request);
                    return account
                        .$promise
                        .then(function(account) {
                            $timeout.cancel(timeout);
                            people.$err = null;
                            add_to_people(account);

                            return $q.all((account.connected || []).filter(function(account) {
                                return !done_account_ids[[account.api, account.type, account.id].join('/')];
                            }).map(get_account));
                        })
                        .catch(function(err) {
                            if (people.length || people.$err) {
                                return;
                            }
                            $timeout.cancel(timeout);
                            err.api = request.api;
                            people.$err = err;
                        });
                }))
                .then(function() {
                    if (people.length || people.$err) {
                        return;
                    }
                    people.$err = { 'bad-input': true };
                })
                .finally(function() {
                    people.$resolved = true;
                });

                return people;
            }());
        });
        */
    }])
    .directive('peopleCarousel', ['$compile', function($compile) {
        return {
            link: function($scope, $element) {
                $element.slick({ arrows: false, centerMode: true, centerPadding: 0, focusOnSelect: true, infinite: false, slidesToShow: 1 });
                $element.on('afterChange', function(event, slick, index) {
                    $scope.$apply(function() {
                        $scope.entry.selectedPerson = $scope.data.people[index];
                    });
                });
                $scope.$watchCollection('data.people', function(people, oldPeople) {
                    if (oldPeople && oldPeople.length && people !== oldPeople) {
                        oldPeople.forEach(function() {
                            $element.slick('slickRemove', 0);
                        });
                    }
                    if (people && people.length) {
                        people.forEach(function(person) {
                            var element = '<div style="height: 157px;"><div ng-include="\'templates/\' + person.selectedAccount.api + \'_account.html\'"></div></div>';
                            var scope = $scope.$new();
                            scope.person = person;
                            $element.slick('slickAdd', $compile(element)(scope));
                        });
                    }
                    $scope.entry.selectedPerson = (people && people[$element.slick('slickCurrentSlide') || 0]) || null;
                });
            }
        };
    }])
    .name;
