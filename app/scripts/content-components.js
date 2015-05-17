var angular = require('angular');

module.exports = angular.module(chrome.i18n.getMessage('app_short_name') + 'ContentComponents', [require('./service-components')])
    .controller('ContentController', ['$scope', 'apiService', function($scope, apiService) {
        $scope.$watch('entry.content', function(request) {
            if (!request) {
                $scope.data.content = null;
                return;
            }
            $scope.reload = function() {
                $scope.data.content = apiService.get(request);
            };
            $scope.reload();
        });

        $scope.$watch('data && data.content.$resolved && entry && data.content', function(content) {
            if (!content) {
                return;
            }

            if (content.discussions && content.discussions.length) {
                chrome.storage.sync.get('order', function(obj) {
                    obj.order = obj.order || [];
                    $scope.$apply(function() {
                        $scope.entry.discussions = ($scope.entry.discussions || []);
                        content.discussions.forEach(function(discussion) {
                            if ($scope.entry.discussions.some(function(entry_discussion) { return discussion.api === entry_discussion.api; })) {
                                return;
                            }
                            $scope.entry.discussions.push(discussion);
                        });
                        $scope.entry.discussions.sort(function(a, b) {
                            return obj.order.indexOf(a.api) - obj.order.indexOf(b.api);
                        });
                    });
                });
            }

            if (content.accounts && content.accounts.length) {
                $scope.entry.accounts = ($scope.entry.accounts || []);
                content.accounts.forEach(function(account) {
                    if ($scope.entry.accounts.some(function(entry_account) { return account.api === entry_account.api &&
                                                                                    account.id  === entry_account.id; })) {
                        return;
                    }
                    $scope.entry.accounts.push(account);
                });
            }
        });
    }])
    .name;
