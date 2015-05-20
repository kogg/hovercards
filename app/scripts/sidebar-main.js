var $       = require('jquery');
require('perfect-scrollbar/jquery')($);
$('body').perfectScrollbar();
var angular = require('angular');

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
