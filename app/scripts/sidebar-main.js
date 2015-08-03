var $       = require('jquery');
var angular = require('angular');
var common  = require('./common');

var EXTENSION_ID = chrome.i18n.getMessage('@@extension_id');

angular.bootstrap(document, [angular.module('app', [// Dependencies
                                                    require('angular-animate'),
                                                    require('angular-inview/angular-inview') && 'angular-inview',

                                                    // Application Components
                                                    require('./sidebar-components'),
                                                    require('./common-components'),

                                                    // Data Related Components
                                                    require('./entry-components'),
                                                    require('./content-components'),
                                                    require('./discussion-components'),
                                                    require('./people-components'),
                                                    require('./more-content-components'),

                                                    // API Specific Components
                                                    require('./imgur-components'),
                                                    require('./reddit-components')]).name]);

if (common.get_scrollbar_width()) {
    require('perfect-scrollbar/jquery')($);
    $('html,body').css('overflow', 'hidden');
    $('body').perfectScrollbar();
}

window.top.postMessage({ msg: EXTENSION_ID + '-ready' }, '*');

$('body').on('mousedown', 'a[href]', function() {
    $(this).attr('target', '_blank');
});


$(function() {
  function materialripple() {
    $('body').on('click', '.rippleblack', function (event) {
      var $div = $('<div/>'),
          btnOffset = $(this).offset(),
          xPos = event.pageX - btnOffset.left,
          yPos = event.pageY - btnOffset.top;

      $div
        .addClass('circle')
        .css({
          top: yPos - 15,
          left: xPos - 15
        })
        .appendTo($(this));

      window.setTimeout(function(){
        $div.remove();
      }, 2000);
    });
  }
  materialripple();
});
