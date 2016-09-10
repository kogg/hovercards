var report = require('../../report');
require('../css/index.css');
var $ = require('jquery');

/* global ga */
$(function() {
	var ALL_TIMINGS = [
		[3000, 3000, 3000],
		[2700, 3500, 2600, 800],
		[4200, 700, 4200, 700]
	];

	$('.image-holder').each(function(index) {
		var i = -1;
		var timings = ALL_TIMINGS[index];
		var image_holder = $(this);
		function cycle_slides() {
			image_holder.removeClass('hovercard-slide' + (index ? (index + 1) : '') + '-' + ((i % timings.length) + 1));
			i++;
			image_holder.addClass('hovercard-slide' + (index ? (index + 1) : '') + '-' + ((i % timings.length) + 1));
			setTimeout(cycle_slides, timings[i % timings.length]);
		}
		cycle_slides();
	});

	var screenheight;
	var moverpositions;
	var screenmovers = $('.screenmover');
	var screens      = $('.screen');
	function scroll() {
		var scrollTop = $(window).scrollTop();
		screens.each(function(i) {
			$(this).toggleClass('active-screen', (scrollTop + screenheight > moverpositions[i]) && (!moverpositions[i + 1] || (scrollTop + screenheight <= moverpositions[i + 1])));
		});
		$('.github-fork').toggleClass('github-fork-active', screens.last().hasClass('active-screen'));
	}
	function resize() {
		screenheight = $(window).height();
		moverpositions = screenmovers.map(function() {
			return $(this).offset().top;
		}).get();
		scroll();
	}
	resize();
	$(document).on('scroll', scroll);
	$(window).on('resize', resize);

	$('a[href="https://chrome.google.com/webstore/detail/hovercards/dighmiipfpfdfbfmpodcmfdgkkcakbco"]').click(function() {
		ga('send', 'event', 'install link', 'click', $(this).parents('.controw').data('id'));
	});
	if (window.chrome && window.chrome.webstore && window.chrome.webstore.install) {
		$('a[href="https://chrome.google.com/webstore/detail/hovercards/dighmiipfpfdfbfmpodcmfdgkkcakbco"]').click(function(e) {
			if (e.which === 3 || e.metaKey || e.ctrlKey) {
				return;
			}
			e.preventDefault();
			window.chrome.webstore.install('https://chrome.google.com/webstore/detail/dighmiipfpfdfbfmpodcmfdgkkcakbco',
				function() { },
				function(error) {
					report.captureException(error, {
						level: 'warning'
					});
				}
			);
		});
	}
	$('a[href*="#"]:not([href="#"])').click(function() {
		if (location.pathname.replace(/^\//, '') === this.pathname.replace(/^\//, '') && location.hostname === this.hostname) {
			var target = $(this.hash);
			target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
			if (target.length) {
				$('html, body').animate({
					scrollTop: target.offset().top
				}, 1000);
				return false;
			}
		}
	});
});

/*eslint-disable */

/*
 * FACEBOOK STUFF
 */
(function(d, s, id) {
	  var js, fjs = d.getElementsByTagName(s)[0];
	  if (d.getElementById(id)) return;
	  js = d.createElement(s); js.id = id;
	  js.src = '//connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.4';
	  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

/*
 * TWITTER STUFF
 */
! function(d, s, id) {var js, fjs = d.getElementsByTagName(s)[0], p = /^http:/.test(d.location)?'http':'https'; if (!d.getElementById(id)) {js = d.createElement(s);js.id = id;js.src = p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js, fjs);}}(document, 'script', 'twitter-wjs');

/*eslint-enable */
