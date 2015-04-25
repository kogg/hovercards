var angular = require('angular');

module.exports = angular.module('hovercardsCommonComponents', [require('angular-sanitize')])
    .directive('clickActivate', function() {
        return {
            restrict: 'A',
            scope: {
                clickActivate: '@'
            },
            link: function($scope, $element) {
                $element.on('click', function() {
                    window.top.postMessage({ msg: 'activate', url: $scope.clickActivate }, '*');
                });
            }
        };
    })
    .directive('readmore', ['$sanitize', function($sanitize) {
        require('dotdotdot');

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
    }])
    .directive('sortable', function() {
        require('jquery-ui/sortable');
        require('jquery-ui/droppable');

        return {
            restrict: 'A',
            link: function($scope, $element) {
                $element.sortable({ placeholder: 'ui-state-highlight' });
                $element.disableSelection();
            }
        };
    })
    .filter('copy', function() {
        return function(messagename) {
            if (!messagename) {
                return messagename;
            }
            return chrome.i18n.getMessage(messagename.replace(/\-/g, '_')) || messagename;
        };
    })
    .filter('htmlify', ['$filter', function($filter) {
        return function(content) {
            return $filter('linky')(content, '_blank');
        };
    }])
    .filter('numsmall', function() {
        return function(number) {
            if (number < 10000) {
                return number + '';
            } else if (number < 1000000) {
                return Math.floor(number / 1000) + 'k';
            } else if (number < 1000000000) {
                return parseFloat(Math.floor(number / 10000) / 100).toFixed(2) + 'm';
            } else if (number < 1000000000000) {
                return parseFloat(Math.floor(number / 10000000) / 100).toFixed(2) + 'b';
            }
        };
    })
    .filter('trustresourceurl', ['$sce', function($sce) {
        return function(url) {
            return $sce.trustAsResourceUrl(url);
        };
    }])
    .name;
