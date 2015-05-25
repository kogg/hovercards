var angular      = require('angular');
var network_urls = require('YoCardsApiCalls/network-urls');

module.exports = angular.module(chrome.i18n.getMessage('app_short_name') + 'EntryComponents', [require('./service-components')])
    .controller('EntryController', ['$scope', '$timeout', 'apiService', function($scope, $timeout, apiService) {
        window.addEventListener('message', function(event) {
            var request = event.data;
            // TODO Determine if this is our request and not someone else's
            switch(request.msg) {
                case 'load':
                    $scope.$apply(function() {
                        $scope.entry           = null;
                        $scope.data            = {};
                        $scope.view.fullscreen = false;
                    });
                    $timeout(function() {
                        var identity = network_urls.identify(request.url);
                        if (identity) {
                            $scope.entry = { type: identity.type };
                            switch ($scope.entry.type) {
                                case 'content':
                                    $scope.entry.content = identity;
                                    break;
                                case 'discussion':
                                    $scope.entry.discussions = {};
                                    $scope.entry.discussions[identity.api] = identity;
                                    $scope.entry.desired_discussion_api = identity.api;
                                    break;
                                case 'account':
                                    $scope.entry.accounts = [identity];
                                    break;
                            }
                        } else {
                            var entry = { discussions: {}, type: 'url', desired_discussion_api: 'url' };
                            var data  = { discussions: {} };

                            var apis = ['reddit', 'twitter'];

                            apis.forEach(function(api) {
                                entry.discussions[api] = { api: api, type: 'discussion' };
                                data.discussions[api]  = apiService.get({ api: api, type: 'url', id: request.url });
                            });

                            chrome.storage.sync.get('order', function(obj) {
                                var order = obj.order || [];
                                apis.sort(function(a, b) {
                                    return order.indexOf(a) - order.indexOf(b);
                                });

                                function check_api(i) {
                                    if (apis.length === i) {
                                        entry.$err = { 'bad-input': true };
                                        return;
                                    }
                                    var api = apis[i];
                                    data.discussions[api]
                                        .$promise
                                        .then(function() {
                                            if (entry.desired_discussion_api !== 'url') {
                                                return;
                                            }
                                            entry.desired_discussion_api = api;
                                        })
                                        .catch(function() {
                                            check_api(i + 1);
                                        });
                                }
                                check_api(0);
                            });

                            $scope.entry = entry;
                            $scope.data = data;
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
    }])
    .name;
