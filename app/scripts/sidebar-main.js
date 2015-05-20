var $       = require('jquery');
var angular = require('angular');
var common  = require('./common');

if (common.get_scrollbar_width()) {
    require('perfect-scrollbar/jquery')($);
    $('html,body').css('overflow', 'hidden');
    $('body').perfectScrollbar();
}

angular.bootstrap(document, [require('./angular-app').name]);

window.top.postMessage({ msg: 'ready' }, '*');

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
