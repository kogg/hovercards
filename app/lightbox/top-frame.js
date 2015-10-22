var $                = require('jquery');
var _                = require('underscore');
var analytics        = require('../analytics');
var network_urls     = require('hovercardsshared/network-urls');
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

$.lightbox = function(identity, hovercard) {
	if (typeof identity === 'string') {
		identity = network_urls.identify(identity);
	}
	if (!identity) {
		return;
	}
	var analytics_label = (identity.type === 'url') ? 'url' : identity.api + ' ' + identity.type;
	analytics('send', 'event', 'lightbox displayed', 'hovercard clicked', analytics_label, { nonInteraction: true });
	var lightbox_start = Date.now();

	var lightbox_backdrop = $('<div></div>')
		.addClass(_.prefix('lightbox-backdrop'))
		.appendTo('html');
	var lightbox_container;
	var lightbox;
	var window_scroll = { top: $(window).scrollTop(), left: $(window).scrollLeft() };
	if (hovercard) {
		lightbox = hovercard;
		lightbox_container = lightbox.parent();
		lightbox_container
			.css('height', lightbox_container.height() + 1)
			.css('width', lightbox_container.width() + 1);
	} else {
		lightbox = $('<div></div>').addClass(_.prefix('box'));

		lightbox_container = $('<div></div>')
			.addClass(_.prefix('container'))
			.css('height', '0')
			.css('width', '0')
			.css('top', window_scroll.top + $(window).height() / 2)
			.css('left', window_scroll.left + $(window).width() / 2)
			.append(lightbox)
			.appendTo('html');
	}

	template_loading(lightbox, identity, true);

	setTimeout(function() {
		lightbox_container
			.addClass(_.prefix('container--lightbox'))
			.removeClass(_.prefix('container--hovercard'))
			.removeClass(_.prefix('container--hovercard--top'))
			.removeClass(_.prefix('container--hovercard--bottom'))
			.css('height', '100%')
			.css('width', '100%')
			.css('top', window_scroll.top)
			.css('left', window_scroll.left)
			.on('transitionend', function set_overflow(e) {
				if (e.originalEvent.propertyName !== 'height') {
					return;
				}
				lightbox_container
					.off('transitionend', set_overflow)
					.css('overflow', 'auto');
			});
		lightbox
			.addClass(_.prefix('lightbox'))
			.removeClass(_.prefix('hovercard'));
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
	function lightbox_leave() {
		analytics('send', 'timing', 'lightbox', 'showing', Date.now() - lightbox_start, analytics_label);

		lightbox.toggleAnimationClass('lightbox--leave', function() {
			lightbox_container.remove();
		});
		lightbox_backdrop.toggleAnimationClass('lightbox-backdrop--leave', function() {
			lightbox_backdrop.remove();
		});

		lightbox.off('click', stop_propagation);
		$(document).off('keydown', keydown);
		$(window).off('scroll', lightbox_leave);
		lightbox_container.off('click', lightbox_leave);
		lightbox_backdrop.off('click', lightbox_leave);
	}
	lightbox.on('click', stop_propagation);
	$(document).on('keydown', keydown);
	$(window).one('scroll', lightbox_leave);
	lightbox_container.one('click', lightbox_leave);
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
