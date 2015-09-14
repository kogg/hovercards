var _       = require('underscore');
var angular = require('angular');

var network_urls = require('YoCardsApiCalls/network-urls');

var EXTENSION_ID = chrome.i18n.getMessage('@@extension_id');

module.exports = angular.module(chrome.i18n.getMessage('app_short_name') + 'HovercardComponents', [require('./service-components')])
    .controller('EntryController', ['$scope', '$window', function($scope, $window) {
        var identity = null;

        chrome.storage.sync.get('order', function(obj) {
            if (!obj.order) {
                obj.order = [];
            }
            var original_length = obj.order.length;
            obj.order = _.union(obj.order, ['reddit', 'twitter', 'imgur', 'instagram', 'soundcloud', 'youtube']);
            if (original_length !== obj.order.length) {
                chrome.storage.sync.set(obj);
            }
        });

        $window.addEventListener('message', function(event) {
            if (!event || !event.data) {
                return;
            }
            switch (event.data.msg) {
                case EXTENSION_ID + '-load':
                    $scope.$apply(function() {
                        $scope.data  = {};
                        identity = event.data.identity;
                        var type_to_load = identity.type !== 'discussion' ? identity.type : 'content';
                        var start = _.now();
                        $scope.entry = {
                            api:  identity.api,
                            type: type_to_load,
                            timing: {
                                content: _.once(function(time, api) {
                                    angular.element.analytics('send', 'timing', 'hovercard', 'card loaded', time - start, api + ' content');
                                }),
                                account: _.once(function(time, api) {
                                    angular.element.analytics('send', 'timing', 'hovercard', 'card loaded', time - start, api + ' account');
                                })
                            }
                        };
                        $scope.entry[type_to_load] = _.chain(identity).clone().extend({ type: type_to_load }).value();
                    }, 100);
                    break;
                case EXTENSION_ID + '-hide':
                    $scope.$apply(function() {
                        $scope.entry = null;
                    });
                    break;
            }
        }, false);

        angular.element(document).on('click', function(e) {
            if (!identity) {
                return;
            }
            e.preventDefault();
            $window.parent.postMessage({ msg: EXTENSION_ID + '-hovercard-clicked', url: network_urls.generate(identity) }, '*');
        });
    }])
    .controller('DiscussionController', ['$scope', 'apiService', function($scope, apiService) {
        $scope.$watch('entry.discussions', function(requests) {
            if (!requests) {
                return;
            }
            var data = $scope.data;
            data.discussions = [];
            _.chain(requests)
             .omit(function(request, api) {
                 return api === data.content.api ||
                        (api === 'imgur' && request.as !== 'gallery') ||
                        (api === 'soundcloud' && request.as !== 'track');
             })
             .values()
             .map(_.partial(apiService.get, _, null, null))
             .each(function(discussion) {
                 discussion.$promise.then(function(discussion) {
                     data.discussions.push(discussion);
                 });
             })
             .value();
        }, true);
    }])
    .controller('AccountController', ['$scope', '$timeout', 'apiService', function($scope, $timeout, apiService) {
        $scope.$watch('entry.account', function(request) {
            if (!request) {
                $scope.data.account = null;
                return;
            }
            var entry = $scope.entry;
            (function reload() {
                var account = apiService.get(request);
                $scope.data.account = account;
                var timeout = $timeout(function() {
                    account.$err = { 'still-waiting': true, api: request.api };
                }, 5000);
                account.$promise
                    .finally(function() {
                        $timeout.cancel(timeout);
                    })
                    .then(function(account) {
                        delete account.$err;
                        entry.timing.account(_.now(), account.api);
                    })
                    .catch(function(err) {
                        err.reload = reload;
                    });
            }());
        });
    }])
    .filter('pluck', _.constant(_.pluck))
    .filter('firstInOrder', [function() {
        var order = ['reddit', 'twitter', 'imgur', 'instagram', 'soundcloud', 'youtube'];
        chrome.storage.sync.get('order', function(obj) { order = obj.order; });
        // FIXME Update when storage changes
        chrome.storage.onChanged.addListener(function onStorageChanged(changes, area_name) {
            if (area_name !== 'sync' || !('order' in changes)) {
                return;
            }
            order = changes.order.newValue;
        });

        return function(apis) {
            return _.chain(apis)
                    .sortBy(function(api) { return _.indexOf(order, api); })
                    .first()
                    .value();
        };
    }])
    .name;
