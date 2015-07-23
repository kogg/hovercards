var _       = require('underscore');
var angular = require('angular');

var EXTENSION_ID = chrome.i18n.getMessage('@@extension_id');

module.exports = angular.module(chrome.i18n.getMessage('app_short_name') + 'EntryComponents', [require('./service-components')])
    .controller('EntryController', ['$scope', '$timeout', '$window', 'apiService', function($scope, $timeout, $window, apiService) {
        $scope.service = apiService;

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
            var request = event.data;
            // TODO Determine if this is our request and not someone else's
            switch(request.msg) {
                case EXTENSION_ID + '-load':
                    $scope.$apply(function() {
                        $scope.entry = null;
                        $scope.data  = {};
                    });
                    $timeout(function() {
                        var identity = request.identity;
                        var start = _.now();
                        $scope.entry = {
                            type: identity.type,
                            timing: {
                                content: _.once(function(time, api) {
                                    window.top.postMessage({ msg: EXTENSION_ID + '-analytics', request: ['send', 'timing', 'cards', 'Time until First Content Card', time - start, api + ' content'] }, '*');
                                    $scope.entry.timing.first_card(time, api + ' content');
                                }),
                                discussion: _.once(function(time, api) {
                                    window.top.postMessage({ msg: EXTENSION_ID + '-analytics', request: ['send', 'timing', 'cards', 'Time until First Discussion Card', time - start, api + ' discussion'] }, '*');
                                    $scope.entry.timing.first_card(time, api + ' discussion');
                                }),
                                account: _.once(function(time, needed_scrolling, api) {
                                    window.top.postMessage({ msg: EXTENSION_ID + '-analytics', request: ['send', 'timing', 'cards', 'Time until First Account Card (' + (needed_scrolling ? 'Needed Scrolling' : 'Didn\'t need Scrolling') + ')', time - start, api + ' account'] }, '*');
                                    $scope.entry.timing.first_card(time, api + ' account');
                                }),
                                first_card: _.once(function(time, type) {
                                    window.top.postMessage({ msg: EXTENSION_ID + '-analytics', request: ['send', 'timing', 'cards', 'Time until First Card', time - start, type] }, '*');
                                })
                            }
                        };
                        switch (identity.type) {
                            case 'content':
                                $scope.entry.content = identity;
                                break;
                            case 'discussion':
                                $scope.entry.discussions = {};
                                $scope.entry.discussions[identity.api] = identity;
                                $scope.entry.discussion_api = identity.api;
                                break;
                            case 'account':
                                $scope.entry.accounts = [identity];
                                break;
                            case 'url':
                                $scope.entry.url = identity.id;
                                $scope.entry.discussions = { reddit:  { api: 'reddit',  type: 'url', id: identity.id },
                                                             twitter: { api: 'twitter', type: 'url', id: identity.id } };
                                break;
                        }
                    }, 100);
                    break;
                case EXTENSION_ID + '-hide':
                    $scope.$apply(function() {
                        $scope.entry = null;
                    });
                    break;
                case EXTENSION_ID + '-sameload':
                    $scope.$apply(function() {
                        if (!$scope.entry) {
                            return;
                        }
                        $scope.entry.shake = ($scope.entry.shake || 0) + 1;
                    });
                    break;
            }
        }, false);

        $scope.$watch('data.content', function(content, oldContent) {
            if (content || oldContent !== $scope.view.fullscreen) {
                return;
            }
            $scope.view.fullscreen = null;
        });
    }])
    .name;
