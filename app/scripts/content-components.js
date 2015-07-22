var _       = require('underscore');
var angular = require('angular');

module.exports = angular.module(chrome.i18n.getMessage('app_short_name') + 'ContentComponents', [require('./service-components')])
    .controller('ContentController', ['$scope', '$q', '$timeout', 'apiService', function($scope, $q, $timeout, apiService) {
        $scope.$watch('entry.content', function(request) {
            if (!request) {
                $scope.data.content = null;
                return;
            }
            var entry = $scope.entry;
            (function reload() {
                var content = apiService.get(request);
                $scope.data.content = content;
                var timeout = $timeout(function() {
                    content.$err = { 'still-waiting': true, api: request.api };
                }, 5000);
                content.$promise
                    .finally(function() {
                        $timeout.cancel(timeout);
                    })
                    .then(function(content) {
                        delete content.$err;

                        entry.timing.content(_.now(), content.api);
                        entry.accounts = _.chain(content.accounts)
                                          .union(entry.accounts)
                                          .compact()
                                          .sortBy(function(account) {
                                              var pos = _.indexOf(['author', 'tag', 'mention'], account.reason);
                                              if (pos === -1) {
                                                  pos = Infinity;
                                              }
                                              return pos;
                                          })
                                          .uniq(false, function(account) {
                                              return account.api + '/' + account.id;
                                          })
                                          .value();
                        return content;
                    })
                    .catch(function(err) {
                        err.reload = reload;
                        return $q.reject(err);
                    })
                    .finally(function() {
                        entry.discussions = _.extend((function get_discussions() {
                            var for_request = content.$err ? request : content;
                            if (content.api === 'reddit' || !for_request.api || !for_request.id) {
                                return {};
                            }
                            var discussions = {};
                            discussions.reddit  = { api: 'reddit',  type: 'discussion', for: for_request };
                            discussions.twitter = { api: 'twitter', type: 'discussion', for: for_request };
                            discussions[for_request.api] = _.extend({}, for_request, { type: 'discussion' });
                            return discussions;
                        }()), entry.discussions);
                    });
            }());
        });
    }])
    .name;
