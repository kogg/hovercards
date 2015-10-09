var $            = require('jquery');
var network_urls = require('hovercardsshared/old-apis/network-urls');
require('./common');

var EXTENSION_ID = chrome.i18n.getMessage('@@extension_id');

var templates = {
	'loading':             require('hovercardsshared/views/loading.tpl'),
	'imgur-content':       require('hovercardsshared/views/imgur-content.tpl'),
	'imgur-account':       require('hovercardsshared/views/imgur-account.tpl'),
	'instagram-content':   require('hovercardsshared/views/instagram-content.tpl'),
	'instagram-account':   require('hovercardsshared/views/instagram-account.tpl'),
	'reddit-content':      require('hovercardsshared/views/reddit-content.tpl'),
	'reddit-account':      require('hovercardsshared/views/reddit-account.tpl'),
	'soundcloud-content':  require('hovercardsshared/views/soundcloud-content.tpl'),
	'soundcloud-account':  require('hovercardsshared/views/soundcloud-account.tpl'),
	'twitter-content':     require('hovercardsshared/views/twitter-content.tpl'),
	'twitter-account':     require('hovercardsshared/views/twitter-account.tpl'),
	'youtube-content':     require('hovercardsshared/views/youtube-content.tpl'),
	'youtube-account':     require('hovercardsshared/views/youtube-account.tpl')
};

$.fn.extend({
	toggleAnimationClass: function(className, callback) {
		return this
			.addClass(EXTENSION_ID + '-' + className)
			.on('animationend', function animationend(e) {
				if (e.originalEvent.animationName !== className + '-animation') {
					return;
				}
				$(this)
					.off('animationend', animationend)
					.removeClass(className);
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
	$.analytics('send', 'event', 'lightbox displayed', 'hovercard clicked', analytics_label, { nonInteraction: true });
	var lightbox_start = Date.now();

	var lightbox_backdrop = $('<div class="' + EXTENSION_ID + '-lightbox-backdrop"></div>').appendTo('html');
	var lightbox_container;
	var lightbox;
	var window_scroll = { top: $(window).scrollTop(), left: $(window).scrollLeft() };
	if (hovercard) {
		lightbox_container = hovercard.parent();
		lightbox = hovercard;
		lightbox_container
			.css('height', lightbox_container.height() + 1)
			.css('width', lightbox_container.width() + 1);
	} else {
		lightbox_container = $('<div></div>')
			.css('height', '0')
			.css('width', '0')
			.css('top', window_scroll.top + $(window).height() / 2)
			.css('left', window_scroll.left + $(window).width() / 2)
			.appendTo('html');
		var loading = $('<div></div>').append(templates.loading());
		lightbox = $('<div></div>')
			.append(loading)
			.appendTo(lightbox_container);
		// TODO
		$.service(identity, function(err, data) {
			if (err) {
				return loading.replaceWith((err.message || 'ERROR') + '');
			}
			loading.replaceWith(templates[identity.api + '-' + identity.type](data));
		});
	}
	setTimeout(function() {
		lightbox_container
			.addClass(EXTENSION_ID + '-lightbox-container')
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
		lightbox.addClass(EXTENSION_ID + '-lightbox');
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
		$.analytics('send', 'timing', 'lightbox', 'showing', Date.now() - lightbox_start, analytics_label);

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
	}
	lightbox.on('click', stop_propagation);
	$(document).on('keydown', keydown);
	$(window).one('scroll', lightbox_leave);
	lightbox_container.one('click', lightbox_leave);
};

window.addEventListener('message', function(event) {
	if (!event || !event.data) {
		return;
	}
	var message = event.data;
	if (message.msg !== EXTENSION_ID + '-lightbox') {
		return;
	}
	$.lightbox(message.identity, message.obj);
});
