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
                                account: _.once(function(time, needed_scrolling, api) {
                                    $window.top.postMessage({ msg: EXTENSION_ID + '-analytics', request: ['send', 'timing', 'hovercard', 'Time until Account Hovercard', time - start, api + ' account'] }, '*');
                                })
                            }
                        };
                        switch (identity.type) {
                            case 'content':
                                $scope.entry.content = identity;
                                break;
                            case 'account':
                                $scope.entry.account = identity;
                                break;
                        }
                    }, 100);
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
