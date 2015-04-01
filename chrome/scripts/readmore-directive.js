'use strict';

define(['angular-app', 'angular-sanitize', 'dotdotdot'], function(app) {
    app.directive('readmore', ['$sanitize', function($sanitize) {
        return {
            restrict: 'A',
            scope: {
                text: '=readmore'
            },
            link: function($scope, $element) {
                $element.html($sanitize($scope.text + ' <span class="read-more">Read More</span>'));
                $element.dotdotdot({
                    after: 'span.read-more',
                    callback: function(isTruncated) {
                        var link = $element.find('span.read-more');
                        if (!isTruncated) {
                            link.remove();
                            return;
                        }
                        $element.append(link); // FIXME Hack AF https://github.com/BeSite/jQuery.dotdotdot/issues/67
                        link.click(function() {
                            $element.trigger('destroy');
                            $element.css('max-height', 'none');
                            $element.html($sanitize($scope.text));
                        });
                    }
                });
            }
        };
    }]);
});
