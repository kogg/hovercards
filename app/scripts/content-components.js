var angular = require('angular');

module.exports = angular.module(chrome.i18n.getMessage('app_short_name') + 'ContentComponents', [require('./service-components')])
    .controller('ContentController', ['$scope', 'apiService', function($scope, apiService) {
        $scope.$watch('entry.content', function(request) {
            if (!request) {
                $scope.data.content = null;
                return;
            }
            $scope.reload = function() {
                $scope.view.fullscreen = false;
                $scope.data.content = apiService.get(request);
            };
            $scope.reload();
        });

        $scope.$watch('data.content.$resolved && entry && entry.type !== "url" && data.content', function(content) {
            if (!content) {
                return;
            }

            if (content.discussions && content.discussions.length) {
                $scope.entry.discussions = ($scope.entry.discussions || {});
                content.discussions.forEach(function(discussion) {
                    $scope.entry.discussions[discussion.api] = $scope.entry.discussions[discussion.api] || discussion;
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
