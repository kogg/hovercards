var _       = require('underscore');
var angular = require('angular');

var network_urls = require('YoCardsApiCalls/network-urls');

var EXTENSION_ID = chrome.i18n.getMessage('@@extension_id');

module.exports = angular.module(chrome.i18n.getMessage('app_short_name') + 'HovercardComponents', [require('./service-components')])
    .controller('EntryController', ['$scope', '$window', function($scope, $window) {
        var identity = null;

        $window.addEventListener('message', function(event) {
            if (!event || !event.data) {
                return;
            }
            switch (event.data.msg) {
                case EXTENSION_ID + '-load':
                    $scope.$apply(function() {
                        $scope.data  = {};
                        identity = event.data.identity;
                        var start = _.now();
                        $scope.entry = {
                            api:  identity.api,
                            type: identity.type,
                            timing: {
                                content: _.once(function(time, api) {
                                    $window.top.postMessage({ msg: EXTENSION_ID + '-analytics', request: ['send', 'timing', 'hovercard', 'Time until Content Hovercard', time - start, api + ' content'] }, '*');
                                }),
                                account: _.once(function(time, api) {
                                    $window.top.postMessage({ msg: EXTENSION_ID + '-analytics', request: ['send', 'timing', 'hovercard', 'Time until Account Hovercard', time - start, api + ' account'] }, '*');
                                })
                            }
                        };
                        $scope.entry[identity.type] = identity;
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
            data.discussion_count = 0;
            _.chain(requests)
             .omit(function(request, api) {
                 return api === data.content.api ||
                        (api === 'imgur' && request.as !== 'gallery') ||
                        (api === 'soundcloud' && request.as !== 'track');
             })
             .values()
             .map(_.partial(apiService.get, _, null, null))
             .each(function(discussion) {
                 discussion.$promise.then(function() {
                     data.discussion_count++;
                 });
             })
             .value();
        }, true);

        $scope.$watch('entry.discussion_api', function(api) {
            if (!api) {
                return;
            }
            var entry = $scope.entry;
            entry.show_header = null;
            if (!(api in entry.discussions)) {
                return;
            }
            var data = $scope.data;
            data.discussions[api] = data.discussions[api] || apiService.get(entry.discussions[api]);
            data.discussions[api].$promise
                .then(function(discussion) {
                    entry.timing.discussion(_.now(), api);
                    _.extend(discussion, _.pick(entry.discussions[api], 'author'));
                })
                .finally(function() {
                    if (entry.discussion_api !== api) {
                        return;
                    }
                    data.discussion = data.discussions[api];
                });
        });
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
    .name;
