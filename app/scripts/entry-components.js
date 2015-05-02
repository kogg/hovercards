var common = require('./common');

module.exports = angular.module(chrome.i18n.getMessage('app_short_name') + 'EntryComponents', [])
    .controller('EntryController', ['$scope', function($scope) {
        window.addEventListener('message', function(event) {
            var request = event.data;
            // TODO Determine if this is our request and not someone else's
            switch(request.msg) {
                case 'load':
                    $scope.$apply(function() {
                        $scope.entry = null;
                        $scope.data  = {};
                    });
                    setTimeout(function() {
                        var identity = common.identify_url(request.url);
                        $scope.$apply(function() {
                            $scope.entry = {};
                            switch (identity.type) {
                                case 'content':
                                    $scope.entry.content = identity;
                                    break;
                                case 'discussion':
                                    $scope.entry.discussions = [identity];
                                    break;
                                case 'account':
                                    $scope.entry.accounts = [identity];
                                    break;
                            }
                        });
                    }, 100);
                    break;
                case 'hide':
                    $scope.$apply(function() {
                        $scope.entry = null;
                    });
                    break;
            }
        }, false);

        $scope.$watch('data.content.$resolved', function() {
            if (!$scope.data.content || !$scope.data.content.$resolved) {
                return;
            }
            if ($scope.data.content.accounts && !$scope.entry.accounts) {
                $scope.entry.accounts = $scope.data.content.accounts;
            }
            if ($scope.data.content.discussions && !$scope.entry.discussions) {
                $scope.entry.discussions = $scope.data.content.discussions;
            }
        });

        $scope.$watch('data.discussion.$resolved', function() {
            if (!$scope.data.discussion || !$scope.data.discussion.$resolved) {
                return;
            }
            if ($scope.data.discussion.content && !$scope.entry.content) {
                $scope.entry.content = $scope.data.discussion.content;
            }
            if ($scope.data.discussion.accounts && !$scope.entry.accounts) {
                $scope.entry.accounts = $scope.data.discussion.accounts;
            }
        });
    }])
    .name;
