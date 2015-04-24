var gapi = require('gapi');

console.log(gapi);

module.exports = function() {
    return {
        restrict: 'A',
        scope: {
            id:     '=youtubeChannelId',
            offset: '=subscribedOffset'
        },
        link: function($scope, $element) {
            $scope.offset = 0;
            gapi.ytsubscribe.render($element[0], { channelid: $scope.id,
                                                   layout:    'default',
                                                   count:     'hidden',
                                                   onytevent: function(payload) {
                                                       switch (payload.eventType) {
                                                           case 'subscribe':
                                                               $scope.$apply(function() {
                                                                   $scope.offset++;
                                                               });
                                                               break;
                                                           case 'unsubscribe':
                                                               $scope.$apply(function() {
                                                                   $scope.offset--;
                                                               });
                                                               break;
                                                       }
                                                   } });
        }
    };
};
