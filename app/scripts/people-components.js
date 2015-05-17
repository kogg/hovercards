var angular = require('angular');
require('slick-carousel');

module.exports = angular.module(chrome.i18n.getMessage('app_short_name') + 'PeopleComponents', [require('./service-components')])
    .controller('PeopleController', ['$scope', '$timeout', '$q', 'apiService', function($scope, $timeout, $q, apiService) {
        /* check to see if all the things we want to load are out of our way. Also, give them time to animate or whatever */
        $scope.other_things_loaded = 0;
        $scope.$watch('(!entry.content || data.content.$resolved) && (!(entry.discussions || entry.discussion || entry.discussions[0]) || data.discussion.$resolved)', function(value) {
            if (!value) {
                return;
            }
            $timeout(function() {
                angular.element(window).scroll();
                $scope.other_things_loaded++;
            }, 100);
        });
        /* Check to see if we hit the bottom once we've waited for everything and forced a scroll */
        var can_have_people = $scope.$watch('at.people && other_things_loaded', function(value) {
            if (!value) {
                return;
            }
            $scope.can_have_people = true;
            can_have_people();
        });
        /* Load people once we're allowed to */
        $scope.$watchCollection('can_have_people && entry.accounts', function(requests) {
            $scope.entry.selectedPerson = null;
            if (!requests || !requests.length) {
                $scope.data.people = null;
                return;
            }

            $scope.data.loading = ($scope.data.loading || 0) + 1;
            $scope.data.people = (function() {
                var people = [];
                var done_account_ids = {};
                var got_something;
                var last_err;
                people.$resolved = false;
                people.$promise = $q.all(requests.map(function get_account(request) {
                    var account = apiService.get(request);
                    return account.$promise
                        .then(function(account) {
                            got_something = true;
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
                                return !done_account_ids[[account.api, account.type, account.id].join('/')];
                            }).map(get_account));
                        })
                        .catch(function(err) {
                            last_err = err;
                        });
                }))
                .then(function() {
                    if (got_something) {
                        return;
                    }
                    people.$err = last_err || { 'bad-input': true };
                })
                .finally(function() {
                    people.$resolved = true;
                    $scope.data.loading--;
                });

                return people;
            }());
        });
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
