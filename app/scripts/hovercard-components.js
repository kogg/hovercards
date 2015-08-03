var _       = require('underscore');
var angular = require('angular');

var network_urls = require('YoCardsApiCalls/network-urls');

var EXTENSION_ID = chrome.i18n.getMessage('@@extension_id');

module.exports = angular.module(chrome.i18n.getMessage('app_short_name') + 'HovercardComponents', [])
    .controller('EntryController', ['$scope', '$timeout', '$window', function($scope, $timeout, $window) {
        var identity = null;

        $window.addEventListener('message', function(event) {
            if (!event || !event.data) {
                return;
            }
            switch (event.data.msg) {
                case EXTENSION_ID + '-load':
                    $scope.$apply(function() {
                        $scope.entry = null;
                        $scope.data  = {};
                    });
                    $timeout(function() {
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
                                $scope.entry.accounts = [identity];
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
    .name;
