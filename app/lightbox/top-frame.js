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

	var ractive = template_loading(lightbox__box, identity, true);
	lightbox.on('scroll resize', function() {
		ractive.set('scrollpos', lightbox.scrollTop());
		ractive.set('scrollposbottom', lightbox__box.height() - lightbox.height() - ractive.get('scrollpos'));
		ractive.set('boxmargin', ($(window).width() - lightbox__box.width() + _.scrollbar_width()) / 2);
	});

	setTimeout(function() {
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
	}
	lightbox.one('remove_lightbox click', lightbox_leave);
	lightbox__box.on('click', stop_propagation);
	$(document).on('keydown', keydown);
	lightbox_backdrop.one('click', lightbox_leave);
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
