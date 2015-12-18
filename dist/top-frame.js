require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/cameron/Desktop/HoverCards/deckard/app/top-frame.js":[function(require,module,exports){
require('./lightbox/top-frame.js');

},{"./lightbox/top-frame.js":"/Users/cameron/Desktop/HoverCards/deckard/app/lightbox/top-frame.js"}],"/Users/cameron/Desktop/HoverCards/deckard/app/lightbox/top-frame.js":[function(require,module,exports){
var $                = require('jquery');
var _                = require('underscore');
var analytics        = require('../analytics');
var template_loading = require('../template_loading');
require('../common/mixins');
require('./both');

$.fn.extend({
	toggleAnimationClass: function(className, callback) {
		return this
			.addClass(_.prefix(className))
			.on('animationend', function animationend(e) {
				if (e.originalEvent.animationName !== className + '-animation') {
					return;
				}
				$(this)
					.off('animationend', animationend)
					.removeClass(_.prefix(className));
				(callback || $.noop)();
			});
	}
});

var last_lightbox;

$.lightbox = function(identity, hovercard) {
	if (!_.isObject(identity)) {
		return;
	}
	if (last_lightbox) {
		return last_lightbox.trigger('remove_lightbox', [function() {
			$.lightbox(identity, hovercard);
		}]);
	}
	var analytics_label = _.analytics_label(identity);
	analytics('send', 'event', 'lightbox displayed', 'hovercard clicked', analytics_label);
	var lightbox_start = Date.now();

	var lightbox_backdrop = $('<div></div>')
		.addClass(_.prefix('lightbox-backdrop'))
		.appendTo('html');
	var lightbox;
	var lightbox__box;
	var window_scroll = { top: $(window).scrollTop(), left: $(window).scrollLeft() };
	if (hovercard) {
		lightbox = hovercard;
		lightbox__box = hovercard.find('.' + _.prefix('hovercard__box'));
		lightbox
			.css('height', lightbox.height() + 1)
			.css('width', lightbox.width() + 1);
	} else {
		lightbox__box = $('<div></div>')
			.addClass(_.prefix('box'))
			.addClass(_.prefix('boxthing__box'));

		lightbox = $('<div></div>')
			.addClass(_.prefix('boxthing'))
			.css('height', '0')
			.css('width', '0')
			.css('top', window_scroll.top + $(window).height() / 2)
			.css('left', window_scroll.left + $(window).width() / 2)
			.append(lightbox__box)
			.appendTo('html');
	}
	$('body,html').addClass(_.prefix('hide-scrollbar'));
	$('body').addClass(_.prefix('overflow-hidden'));
	last_lightbox = lightbox;

	var boxmargin_resize = _.noop;

	setTimeout(function() {
		var ractive = template_loading(lightbox__box, identity);
		ractive.set('expanded', true);
		if (identity.type === 'content') {
			boxmargin_resize = function() {
				ractive.set('boxmargin', ($(window).width() - lightbox__box.width() + _.scrollbar_width()) / 2);
			};
			lightbox.on('scroll resize', function() {
				ractive.set('scrollpos', lightbox.scrollTop());
				ractive.set('scrollposbottom', lightbox__box.height() - lightbox.height() - ractive.get('scrollpos'));
				if (_.isUndefined(ractive.get('boxmargin'))) {
					$(window).trigger('resize');
				}
			});
		}

		lightbox
			.addClass(_.prefix('lightbox'))
			.removeClass(_.prefix('boxthing'))
			.removeClass(_.prefix('hovercard'))
			.removeClass(_.prefix('hovercard_from_top'))
			.removeClass(_.prefix('hovercard_from_bottom'))
			.css('height', '100%')
			.css('width', '100%')
			.css('top', '')
			.css('left', '')
			.append('<div class="' + _.prefix('x-button') + '"></div>')
			.on('transitionend', function set_overflow(e) {
				if (e.originalEvent.propertyName !== 'height') {
					return;
				}
				lightbox
					.off('transitionend', set_overflow)
					.css('overflow', 'auto');
			});
		lightbox__box
			.addClass(_.prefix('lightbox__box'))
			.removeClass(_.prefix('boxthing__box'))
			.removeClass(_.prefix('hovercard__box'));
	});

	function stop_propagation(e) {
		e.stopPropagation();
	}
	function keydown(e) {
		if (e.which !== 27) {
			return;
		}
		lightbox_leave();
	}
	function lightbox_leave(e, callback) {
		analytics('send', 'timing', 'lightbox', 'showing', Date.now() - lightbox_start, analytics_label);

		if (last_lightbox === lightbox) {
			last_lightbox = null;
		}
		lightbox
			.addClass(_.prefix('lightbox_leaving'))
			.on('animationend', function fade_out_animation_finish(e) {
				if (e.originalEvent.animationName !== 'fade-out-animation') {
					return;
				}
				lightbox.remove();
				$('body,html').removeClass(_.prefix('hide-scrollbar'));
				$('body').removeClass(_.prefix('overflow-hidden'));
				(callback || _.noop)();
			});
		lightbox_backdrop
			.addClass(_.prefix('lightbox-backdrop_leaving'))
			.on('animationend', function fade_out_animation_finish(e) {
				if (e.originalEvent.animationName !== 'background-fade-out-animation') {
					return;
				}
				lightbox_backdrop.remove();
			});

		lightbox.off('remove_lightbox click', lightbox_leave);
		lightbox__box.off('click', stop_propagation);
		$(document).off('keydown', keydown);
		lightbox_backdrop.off('click', lightbox_leave);
		$(window).off('resize', boxmargin_resize);
	}
	lightbox.one('remove_lightbox click', lightbox_leave);
	lightbox__box.on('click', stop_propagation);
	$(document).on('keydown', keydown);
	lightbox_backdrop.one('click', lightbox_leave);
	$(window).on('resize', boxmargin_resize);
};

window.addEventListener('message', function(event) {
	if (!event || !event.data) {
		return;
	}
	var message = event.data;
	if (message.msg !== _.prefix('lightbox')) {
		return;
	}
	$.lightbox(message.identity, message.obj);
});

},{"../analytics":"/Users/cameron/Desktop/HoverCards/deckard/app/analytics/index.js","../common/mixins":"/Users/cameron/Desktop/HoverCards/deckard/app/common/mixins.js","../template_loading":"/Users/cameron/Desktop/HoverCards/deckard/app/template_loading/index.js","./both":"/Users/cameron/Desktop/HoverCards/deckard/app/lightbox/both.js","jquery":"/Users/cameron/Desktop/HoverCards/deckard/node_modules/jquery/dist/jquery.js","underscore":"/Users/cameron/.nvm/versions/node/v4.1.1/lib/node_modules/underscore/underscore.js"}]},{},["/Users/cameron/Desktop/HoverCards/deckard/app/top-frame.js"])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvdG9wLWZyYW1lLmpzIiwiYXBwL2xpZ2h0Ym94L3RvcC1mcmFtZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJyZXF1aXJlKCcuL2xpZ2h0Ym94L3RvcC1mcmFtZS5qcycpO1xuIiwidmFyICQgICAgICAgICAgICAgICAgPSByZXF1aXJlKCdqcXVlcnknKTtcbnZhciBfICAgICAgICAgICAgICAgID0gcmVxdWlyZSgndW5kZXJzY29yZScpO1xudmFyIGFuYWx5dGljcyAgICAgICAgPSByZXF1aXJlKCcuLi9hbmFseXRpY3MnKTtcbnZhciB0ZW1wbGF0ZV9sb2FkaW5nID0gcmVxdWlyZSgnLi4vdGVtcGxhdGVfbG9hZGluZycpO1xucmVxdWlyZSgnLi4vY29tbW9uL21peGlucycpO1xucmVxdWlyZSgnLi9ib3RoJyk7XG5cbiQuZm4uZXh0ZW5kKHtcblx0dG9nZ2xlQW5pbWF0aW9uQ2xhc3M6IGZ1bmN0aW9uKGNsYXNzTmFtZSwgY2FsbGJhY2spIHtcblx0XHRyZXR1cm4gdGhpc1xuXHRcdFx0LmFkZENsYXNzKF8ucHJlZml4KGNsYXNzTmFtZSkpXG5cdFx0XHQub24oJ2FuaW1hdGlvbmVuZCcsIGZ1bmN0aW9uIGFuaW1hdGlvbmVuZChlKSB7XG5cdFx0XHRcdGlmIChlLm9yaWdpbmFsRXZlbnQuYW5pbWF0aW9uTmFtZSAhPT0gY2xhc3NOYW1lICsgJy1hbmltYXRpb24nKSB7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cdFx0XHRcdCQodGhpcylcblx0XHRcdFx0XHQub2ZmKCdhbmltYXRpb25lbmQnLCBhbmltYXRpb25lbmQpXG5cdFx0XHRcdFx0LnJlbW92ZUNsYXNzKF8ucHJlZml4KGNsYXNzTmFtZSkpO1xuXHRcdFx0XHQoY2FsbGJhY2sgfHwgJC5ub29wKSgpO1xuXHRcdFx0fSk7XG5cdH1cbn0pO1xuXG52YXIgbGFzdF9saWdodGJveDtcblxuJC5saWdodGJveCA9IGZ1bmN0aW9uKGlkZW50aXR5LCBob3ZlcmNhcmQpIHtcblx0aWYgKCFfLmlzT2JqZWN0KGlkZW50aXR5KSkge1xuXHRcdHJldHVybjtcblx0fVxuXHRpZiAobGFzdF9saWdodGJveCkge1xuXHRcdHJldHVybiBsYXN0X2xpZ2h0Ym94LnRyaWdnZXIoJ3JlbW92ZV9saWdodGJveCcsIFtmdW5jdGlvbigpIHtcblx0XHRcdCQubGlnaHRib3goaWRlbnRpdHksIGhvdmVyY2FyZCk7XG5cdFx0fV0pO1xuXHR9XG5cdHZhciBhbmFseXRpY3NfbGFiZWwgPSBfLmFuYWx5dGljc19sYWJlbChpZGVudGl0eSk7XG5cdGFuYWx5dGljcygnc2VuZCcsICdldmVudCcsICdsaWdodGJveCBkaXNwbGF5ZWQnLCAnaG92ZXJjYXJkIGNsaWNrZWQnLCBhbmFseXRpY3NfbGFiZWwpO1xuXHR2YXIgbGlnaHRib3hfc3RhcnQgPSBEYXRlLm5vdygpO1xuXG5cdHZhciBsaWdodGJveF9iYWNrZHJvcCA9ICQoJzxkaXY+PC9kaXY+Jylcblx0XHQuYWRkQ2xhc3MoXy5wcmVmaXgoJ2xpZ2h0Ym94LWJhY2tkcm9wJykpXG5cdFx0LmFwcGVuZFRvKCdodG1sJyk7XG5cdHZhciBsaWdodGJveDtcblx0dmFyIGxpZ2h0Ym94X19ib3g7XG5cdHZhciB3aW5kb3dfc2Nyb2xsID0geyB0b3A6ICQod2luZG93KS5zY3JvbGxUb3AoKSwgbGVmdDogJCh3aW5kb3cpLnNjcm9sbExlZnQoKSB9O1xuXHRpZiAoaG92ZXJjYXJkKSB7XG5cdFx0bGlnaHRib3ggPSBob3ZlcmNhcmQ7XG5cdFx0bGlnaHRib3hfX2JveCA9IGhvdmVyY2FyZC5maW5kKCcuJyArIF8ucHJlZml4KCdob3ZlcmNhcmRfX2JveCcpKTtcblx0XHRsaWdodGJveFxuXHRcdFx0LmNzcygnaGVpZ2h0JywgbGlnaHRib3guaGVpZ2h0KCkgKyAxKVxuXHRcdFx0LmNzcygnd2lkdGgnLCBsaWdodGJveC53aWR0aCgpICsgMSk7XG5cdH0gZWxzZSB7XG5cdFx0bGlnaHRib3hfX2JveCA9ICQoJzxkaXY+PC9kaXY+Jylcblx0XHRcdC5hZGRDbGFzcyhfLnByZWZpeCgnYm94JykpXG5cdFx0XHQuYWRkQ2xhc3MoXy5wcmVmaXgoJ2JveHRoaW5nX19ib3gnKSk7XG5cblx0XHRsaWdodGJveCA9ICQoJzxkaXY+PC9kaXY+Jylcblx0XHRcdC5hZGRDbGFzcyhfLnByZWZpeCgnYm94dGhpbmcnKSlcblx0XHRcdC5jc3MoJ2hlaWdodCcsICcwJylcblx0XHRcdC5jc3MoJ3dpZHRoJywgJzAnKVxuXHRcdFx0LmNzcygndG9wJywgd2luZG93X3Njcm9sbC50b3AgKyAkKHdpbmRvdykuaGVpZ2h0KCkgLyAyKVxuXHRcdFx0LmNzcygnbGVmdCcsIHdpbmRvd19zY3JvbGwubGVmdCArICQod2luZG93KS53aWR0aCgpIC8gMilcblx0XHRcdC5hcHBlbmQobGlnaHRib3hfX2JveClcblx0XHRcdC5hcHBlbmRUbygnaHRtbCcpO1xuXHR9XG5cdCQoJ2JvZHksaHRtbCcpLmFkZENsYXNzKF8ucHJlZml4KCdoaWRlLXNjcm9sbGJhcicpKTtcblx0JCgnYm9keScpLmFkZENsYXNzKF8ucHJlZml4KCdvdmVyZmxvdy1oaWRkZW4nKSk7XG5cdGxhc3RfbGlnaHRib3ggPSBsaWdodGJveDtcblxuXHR2YXIgYm94bWFyZ2luX3Jlc2l6ZSA9IF8ubm9vcDtcblxuXHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdHZhciByYWN0aXZlID0gdGVtcGxhdGVfbG9hZGluZyhsaWdodGJveF9fYm94LCBpZGVudGl0eSk7XG5cdFx0cmFjdGl2ZS5zZXQoJ2V4cGFuZGVkJywgdHJ1ZSk7XG5cdFx0aWYgKGlkZW50aXR5LnR5cGUgPT09ICdjb250ZW50Jykge1xuXHRcdFx0Ym94bWFyZ2luX3Jlc2l6ZSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRyYWN0aXZlLnNldCgnYm94bWFyZ2luJywgKCQod2luZG93KS53aWR0aCgpIC0gbGlnaHRib3hfX2JveC53aWR0aCgpICsgXy5zY3JvbGxiYXJfd2lkdGgoKSkgLyAyKTtcblx0XHRcdH07XG5cdFx0XHRsaWdodGJveC5vbignc2Nyb2xsIHJlc2l6ZScsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRyYWN0aXZlLnNldCgnc2Nyb2xscG9zJywgbGlnaHRib3guc2Nyb2xsVG9wKCkpO1xuXHRcdFx0XHRyYWN0aXZlLnNldCgnc2Nyb2xscG9zYm90dG9tJywgbGlnaHRib3hfX2JveC5oZWlnaHQoKSAtIGxpZ2h0Ym94LmhlaWdodCgpIC0gcmFjdGl2ZS5nZXQoJ3Njcm9sbHBvcycpKTtcblx0XHRcdFx0aWYgKF8uaXNVbmRlZmluZWQocmFjdGl2ZS5nZXQoJ2JveG1hcmdpbicpKSkge1xuXHRcdFx0XHRcdCQod2luZG93KS50cmlnZ2VyKCdyZXNpemUnKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0bGlnaHRib3hcblx0XHRcdC5hZGRDbGFzcyhfLnByZWZpeCgnbGlnaHRib3gnKSlcblx0XHRcdC5yZW1vdmVDbGFzcyhfLnByZWZpeCgnYm94dGhpbmcnKSlcblx0XHRcdC5yZW1vdmVDbGFzcyhfLnByZWZpeCgnaG92ZXJjYXJkJykpXG5cdFx0XHQucmVtb3ZlQ2xhc3MoXy5wcmVmaXgoJ2hvdmVyY2FyZF9mcm9tX3RvcCcpKVxuXHRcdFx0LnJlbW92ZUNsYXNzKF8ucHJlZml4KCdob3ZlcmNhcmRfZnJvbV9ib3R0b20nKSlcblx0XHRcdC5jc3MoJ2hlaWdodCcsICcxMDAlJylcblx0XHRcdC5jc3MoJ3dpZHRoJywgJzEwMCUnKVxuXHRcdFx0LmNzcygndG9wJywgJycpXG5cdFx0XHQuY3NzKCdsZWZ0JywgJycpXG5cdFx0XHQuYXBwZW5kKCc8ZGl2IGNsYXNzPVwiJyArIF8ucHJlZml4KCd4LWJ1dHRvbicpICsgJ1wiPjwvZGl2PicpXG5cdFx0XHQub24oJ3RyYW5zaXRpb25lbmQnLCBmdW5jdGlvbiBzZXRfb3ZlcmZsb3coZSkge1xuXHRcdFx0XHRpZiAoZS5vcmlnaW5hbEV2ZW50LnByb3BlcnR5TmFtZSAhPT0gJ2hlaWdodCcpIHtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblx0XHRcdFx0bGlnaHRib3hcblx0XHRcdFx0XHQub2ZmKCd0cmFuc2l0aW9uZW5kJywgc2V0X292ZXJmbG93KVxuXHRcdFx0XHRcdC5jc3MoJ292ZXJmbG93JywgJ2F1dG8nKTtcblx0XHRcdH0pO1xuXHRcdGxpZ2h0Ym94X19ib3hcblx0XHRcdC5hZGRDbGFzcyhfLnByZWZpeCgnbGlnaHRib3hfX2JveCcpKVxuXHRcdFx0LnJlbW92ZUNsYXNzKF8ucHJlZml4KCdib3h0aGluZ19fYm94JykpXG5cdFx0XHQucmVtb3ZlQ2xhc3MoXy5wcmVmaXgoJ2hvdmVyY2FyZF9fYm94JykpO1xuXHR9KTtcblxuXHRmdW5jdGlvbiBzdG9wX3Byb3BhZ2F0aW9uKGUpIHtcblx0XHRlLnN0b3BQcm9wYWdhdGlvbigpO1xuXHR9XG5cdGZ1bmN0aW9uIGtleWRvd24oZSkge1xuXHRcdGlmIChlLndoaWNoICE9PSAyNykge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRsaWdodGJveF9sZWF2ZSgpO1xuXHR9XG5cdGZ1bmN0aW9uIGxpZ2h0Ym94X2xlYXZlKGUsIGNhbGxiYWNrKSB7XG5cdFx0YW5hbHl0aWNzKCdzZW5kJywgJ3RpbWluZycsICdsaWdodGJveCcsICdzaG93aW5nJywgRGF0ZS5ub3coKSAtIGxpZ2h0Ym94X3N0YXJ0LCBhbmFseXRpY3NfbGFiZWwpO1xuXG5cdFx0aWYgKGxhc3RfbGlnaHRib3ggPT09IGxpZ2h0Ym94KSB7XG5cdFx0XHRsYXN0X2xpZ2h0Ym94ID0gbnVsbDtcblx0XHR9XG5cdFx0bGlnaHRib3hcblx0XHRcdC5hZGRDbGFzcyhfLnByZWZpeCgnbGlnaHRib3hfbGVhdmluZycpKVxuXHRcdFx0Lm9uKCdhbmltYXRpb25lbmQnLCBmdW5jdGlvbiBmYWRlX291dF9hbmltYXRpb25fZmluaXNoKGUpIHtcblx0XHRcdFx0aWYgKGUub3JpZ2luYWxFdmVudC5hbmltYXRpb25OYW1lICE9PSAnZmFkZS1vdXQtYW5pbWF0aW9uJykge1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXHRcdFx0XHRsaWdodGJveC5yZW1vdmUoKTtcblx0XHRcdFx0JCgnYm9keSxodG1sJykucmVtb3ZlQ2xhc3MoXy5wcmVmaXgoJ2hpZGUtc2Nyb2xsYmFyJykpO1xuXHRcdFx0XHQkKCdib2R5JykucmVtb3ZlQ2xhc3MoXy5wcmVmaXgoJ292ZXJmbG93LWhpZGRlbicpKTtcblx0XHRcdFx0KGNhbGxiYWNrIHx8IF8ubm9vcCkoKTtcblx0XHRcdH0pO1xuXHRcdGxpZ2h0Ym94X2JhY2tkcm9wXG5cdFx0XHQuYWRkQ2xhc3MoXy5wcmVmaXgoJ2xpZ2h0Ym94LWJhY2tkcm9wX2xlYXZpbmcnKSlcblx0XHRcdC5vbignYW5pbWF0aW9uZW5kJywgZnVuY3Rpb24gZmFkZV9vdXRfYW5pbWF0aW9uX2ZpbmlzaChlKSB7XG5cdFx0XHRcdGlmIChlLm9yaWdpbmFsRXZlbnQuYW5pbWF0aW9uTmFtZSAhPT0gJ2JhY2tncm91bmQtZmFkZS1vdXQtYW5pbWF0aW9uJykge1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXHRcdFx0XHRsaWdodGJveF9iYWNrZHJvcC5yZW1vdmUoKTtcblx0XHRcdH0pO1xuXG5cdFx0bGlnaHRib3gub2ZmKCdyZW1vdmVfbGlnaHRib3ggY2xpY2snLCBsaWdodGJveF9sZWF2ZSk7XG5cdFx0bGlnaHRib3hfX2JveC5vZmYoJ2NsaWNrJywgc3RvcF9wcm9wYWdhdGlvbik7XG5cdFx0JChkb2N1bWVudCkub2ZmKCdrZXlkb3duJywga2V5ZG93bik7XG5cdFx0bGlnaHRib3hfYmFja2Ryb3Aub2ZmKCdjbGljaycsIGxpZ2h0Ym94X2xlYXZlKTtcblx0XHQkKHdpbmRvdykub2ZmKCdyZXNpemUnLCBib3htYXJnaW5fcmVzaXplKTtcblx0fVxuXHRsaWdodGJveC5vbmUoJ3JlbW92ZV9saWdodGJveCBjbGljaycsIGxpZ2h0Ym94X2xlYXZlKTtcblx0bGlnaHRib3hfX2JveC5vbignY2xpY2snLCBzdG9wX3Byb3BhZ2F0aW9uKTtcblx0JChkb2N1bWVudCkub24oJ2tleWRvd24nLCBrZXlkb3duKTtcblx0bGlnaHRib3hfYmFja2Ryb3Aub25lKCdjbGljaycsIGxpZ2h0Ym94X2xlYXZlKTtcblx0JCh3aW5kb3cpLm9uKCdyZXNpemUnLCBib3htYXJnaW5fcmVzaXplKTtcbn07XG5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZnVuY3Rpb24oZXZlbnQpIHtcblx0aWYgKCFldmVudCB8fCAhZXZlbnQuZGF0YSkge1xuXHRcdHJldHVybjtcblx0fVxuXHR2YXIgbWVzc2FnZSA9IGV2ZW50LmRhdGE7XG5cdGlmIChtZXNzYWdlLm1zZyAhPT0gXy5wcmVmaXgoJ2xpZ2h0Ym94JykpIHtcblx0XHRyZXR1cm47XG5cdH1cblx0JC5saWdodGJveChtZXNzYWdlLmlkZW50aXR5LCBtZXNzYWdlLm9iaik7XG59KTtcbiJdfQ==
