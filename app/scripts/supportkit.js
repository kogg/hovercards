'use strict';

/* globals SupportKit:true */
/* jshint unused:false */
require(['jquery'], function($) {
    SupportKit.init({appToken: '4yfkgr5329ya65cuetj7weiyo'});
		$('.feedback-trigger').click(function(){
		    $('#sk-container').show();
		    $(this).hide();
		    $('body').addClass('reduce-padding');
				$('#sk-footer form input').focus();
		    $('html, body').animate({ scrollTop: $(document).height() }, 'slow');
				return false;
		});
		$('body').on('click', '#sk-container', function(){
			$('#sk-footer form input').focus();
		});
});