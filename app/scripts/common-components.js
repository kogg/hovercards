var angular = require('angular');

module.exports = angular.module(chrome.i18n.getMessage('app_short_name') + 'CommonComponents', [require('angular-sanitize')])
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
                chrome.storage.sync.get('order', function(obj) {
                    $scope.order = obj.order || [];
                });

                $scope.$watchCollection('order', function(order, oldOrder) {
                    if (!order || order === oldOrder) {
                        return;
                    }
                    console.log(order);
                    chrome.storage.sync.set({ order: order });
                });

                $element.sortable({ axis:        'y',
                                    handle:      'b',
                                    placeholder: 'ui-state-highlight',
                                    update:      function(event, ui) {
                                        var before = ui.item.prevAll('li').map(function() {
                                            return angular.element(this).scope().discussion_choice.api;
                                        }).toArray();
                                        var after = ui.item.nextAll('li').map(function() {
                                            return angular.element(this).scope().discussion_choice.api;
                                        }).toArray();
                                        var current = angular.element(ui.item).scope().discussion_choice.api;

                                        $scope.$apply(function() {
                                            $scope.order.sort(function(a, b) {
                                                var a_val = (a === current) ? 0 : ((before.indexOf(a) !== -1) ? -1 : ((after.indexOf(a) !== -1) ? 1 : 'idk'));
                                                var b_val = (b === current) ? 0 : ((before.indexOf(b) !== -1) ? -1 : ((after.indexOf(b) !== -1) ? 1 : 'idk'));
                                                if (a_val === 'idk' || b_val === 'idk') {
                                                    return 0;
                                                }
                                                return a_val - b_val;
                                            });
                                        });
                                    } });
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
    .filter('percent', ['$filter', function($filter) {
        return function(ratio) {
            return $filter('number')(100 * ratio) + '%';
        };
    }])
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
                m:      '%dm',
                mm:     '%dm',
                h:      '%dh',
                hh:     '%dh',
                d:      '%dd',
                dd:     '%dd',
                M:      '%dM',
                MM:     '%dM',
                y:      '%dy',
                yy:     '%dy'
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
