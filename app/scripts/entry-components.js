var network_urls = require('YoCardsApiCalls/network-urls');

var extension_id = chrome.i18n.getMessage('@@extension_id');

module.exports = angular.module(chrome.i18n.getMessage('app_short_name') + 'EntryComponents', [require('./service-components')])
    .controller('EntryController', ['$scope', '$timeout', '$q', 'apiService', function($scope, $timeout, $q, apiService) {
        $scope.at  = {};
        window.addEventListener('message', function(event) {
            var request = event.data;
            // TODO Determine if this is our request and not someone else's
            switch(request.msg) {
                case 'load':
                    $scope.$apply(function() {
                        $scope.entry = null;
                        $scope.data  = {};
                    });
                    $timeout(function() {
                        var identity = network_urls.identify(request.url);
                        if (!identity) {
                            $scope.entry = (function() {
                                var entry = {};

                                var got_something = false;
                                $q.all([{ api: 'reddit', type: 'url', id: request.url }].map(function(request) {
                                    $scope.data.loading = ($scope.data.loading || 0) + 1;

                                    return apiService.get(request).$promise
                                        .then(function(thing) {
                                            if (!thing) {
                                                return;
                                            }
                                            got_something = true;
                                            switch (thing.type) {
                                                case 'content':
                                                    entry.content = entry.content || thing;
                                                    break;
                                                case 'discussion':
                                                    entry.discussions = $scope.entry.discussions || [];
                                                    entry.discussions.push(thing);
                                                    break;
                                                case 'account':
                                                    entry.accounts = $scope.entry.accounts || [];
                                                    entry.accounts.push(thing);
                                                    break;
                                            }
                                        })
                                        .finally(function() {
                                            $scope.data.loading--;
                                        });
                                })).catch(function(err) {
                                    entry.$err = err;
                                    if (!got_something) {
                                        entry.$err = entry.$err || 'empty';
                                    }
                                });

                                return entry;
                            }());
                            return;
                        }
                        $scope.entry = { type: identity.type };
                        switch ($scope.entry.type) {
                            case 'content':
                                $scope.entry.content = identity;
                                break;
                            case 'discussion':
                                $scope.entry.discussions = [identity];
                                $scope.entry.discussion = identity;
                                break;
                            case 'account':
                                $scope.entry.accounts = [identity];
                                break;
                        }
                    }, 100);
                    break;
                case 'hide':
                    $scope.$apply(function() {
                        $scope.entry = null;
                    });
                    break;
            }
        }, false);

        angular.element(document).keydown(function(e) {
            if (e.which !== 27 || !$scope.entry.fullscreen) {
                return;
            }
            $scope.$apply(function() {
                $scope.entry.fullscreen = false;
            });
            e.stopImmediatePropagation();
        });

        $scope.$watch('entry.fullscreen', function(fullscreen, oldFullscreen) {
            if (fullscreen === oldFullscreen) {
                return;
            }
            window.top.postMessage({ msg: extension_id + '-fullscreen', value: fullscreen }, '*');
        });

        $scope.$watch('data.content.$resolved', function() {
            if (!$scope.data || !$scope.data.content || !$scope.data.content.$resolved || !$scope.entry) {
                return;
            }

            if ($scope.data.content.discussions && $scope.data.content.discussions.length) {
                $scope.entry.discussions = ($scope.entry.discussions || []);
                chrome.storage.sync.get('order', function(obj) {
                    obj.order = obj.order || [];
                    $scope.$apply(function() {
                        ($scope.data.content.discussions || []).forEach(function(discussion) {
                            if (!$scope.entry.discussions.some(function(entry_discussion) { return discussion.api === entry_discussion.api; })) {
                                $scope.entry.discussions.push(discussion);
                            }
                        });
                        $scope.entry.discussions.sort(function(a, b) {
                            return obj.order.indexOf(a.api) - obj.order.indexOf(b.api);
                        });
                    });
                });
            }

            $scope.entry.accounts = ($scope.entry.accounts || []);
            ($scope.data.content.accounts || []).forEach(function(account) {
                if (!$scope.entry.accounts.some(function(entry_account) { return account.api  === entry_account.api &&
                                                                                 account.id   === entry_account.id; })) {
                    $scope.entry.accounts.push(account);
                }
            });
        });

        $scope.$watch('data.discussion.$resolved', function() {
            if (!$scope.data || !$scope.data.discussion || !$scope.data.discussion.$resolved || !$scope.entry || $scope.entry.type !== 'discussion') {
                return;
            }

            $scope.entry.content = $scope.entry.content || $scope.data.discussion.content;

            $scope.entry.accounts = ($scope.entry.accounts || []);
            ($scope.data.discussion.accounts || []).forEach(function(account) {
                if (!$scope.entry.accounts.some(function(entry_account) { return account.api  === entry_account.api &&
                                                                                 account.id   === entry_account.id; })) {
                    $scope.entry.accounts.push(account);
                }
            });
        });
    }])
    .name;
