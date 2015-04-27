var angular = require('angular');

module.exports = angular.module('hovercardsCommonComponents', [require('angular-sanitize')])
    .directive('readmore', function() {
        require('dotdotdot');

        return {
            restrict: 'A',
            scope: {
                readmore: '='
            },
            link: function($scope, $element) {
                $scope.$watch('readmore', function(readmore) {
                    if (!readmore) {
                        return;
                    }
                    var html = $element.html();
                    angular.element('<span class="read-more">Read More</span>').appendTo($element);
                    $element.dotdotdot({
                        after: 'span.read-more',
                        callback: function(isTruncated) {
                            var link = $element.find('.read-more');
                            if (!isTruncated) {
                                link.remove();
                                return;
                            }
                            $element.append(link); // FIXME Hack AF https://github.com/BeSite/jQuery.dotdotdot/issues/67
                            link.click(function() {
                                $element.trigger('destroy');
                                $element.css('max-height', 'none');
                                $element.html(html);
                            });
                        }
                    });
                });
            }
        };
    })
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
                return '';
            }
            return chrome.i18n.getMessage(messagename.replace(/\-/g, '_')) || messagename;
        };
    })
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
            } else {
                return 0;
            }
        };
    })
    .filter('timeSince', function() {
        var moment  = require('moment');
        return function(time) {
            if (!time) {
                return '';
            }
            moment.locale('en');
            return moment(time).fromNow();
        };
    })
    .filter('timeSinceAbbr', function() {
        var moment  = require('moment');
        moment.locale('en-since-abbrev', {
            relativeTime: {
                future: '%s',
                past:   '%s',
                s:      's',
                m:      '%d m',
                mm:     '%d m',
                h:      '%d h',
                hh:     '%d h',
                d:      '%d d',
                dd:     '%d d',
                M:      '%d M',
                MM:     '%d M',
                y:      '%d y',
                yy:     '%d y'
            }
        });

        return function(time) {
            if (!time) {
                return '';
            }
            moment.locale('en-since-abbrev');
            return moment(time).fromNow();
        };
    })
    .filter('trustresourceurl', ['$sce', function($sce) {
        return function(url) {
            if (!url) {
                return '';
            }
            return $sce.trustAsResourceUrl(url);
        };
    }])
    .animation('.slide-animation', function() {
        return {
            beforeAddClass: function(element, className, done) {
                if (className !== 'ng-hide') {
                    return done();
                }
                element.slideUp(500, done);
            },
            removeClass: function(element, className, done) {
                if (className !== 'ng-hide') {
                    return done();
                }
                element.slideDown(500, done);
            }
        };
    })
    .name;
