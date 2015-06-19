var _       = require('underscore');
var angular = require('angular');

module.exports = angular.module(chrome.i18n.getMessage('app_short_name') + 'EntryComponents', [require('./service-components')])
    .controller('EntryController', ['$scope', '$timeout', 'apiService', function($scope, $timeout, apiService) {
        $scope.service = apiService;

        chrome.storage.sync.get('order', function(obj) {
            if (!obj.order) {
                obj.order = [];
            }
            var original_length = obj.order.length;
            obj.order = _.union(obj.order, ['instagram', 'youtube', 'reddit', 'twitter']);
            if (original_length !== obj.order.length) {
                chrome.storage.sync.set(obj);
            }
        });

        $scope.$watch('entry.selectedPerson.selectedAccount', function(selectedAccount, oldAccount) {
            if ($scope.view && $scope.view.fullscreen && oldAccount) {
                $scope.view.fullscreen = null;
            }
        });

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
                        var identity = request.identity;
                        $scope.entry = { type: identity.type, time: _.now() };
                        switch (identity.type) {
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
                            case 'url':
                                var entry = { discussions: {}, type: 'url', desired_discussion_api: 'url', url: identity.id };
                                var data  = { discussions: {} };

                                var apis = _.sortBy(['reddit', 'twitter'], function(api) {
                                    return $scope.order.indexOf(api);
                                });

                                _.each(apis, function(api) {
                                    entry.discussions[api] = { api: api, type: 'discussion' };
                                    data.discussions[api]  = apiService.get({ api: api, type: 'url', id: entry.url });
                                });

                                function check_api(i) {
                                    if (apis.length === i) {
                                        entry.$err = { 'no-content': true };
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

                                $scope.entry = entry;
                                $scope.data = data;
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
    }])
    .name;
