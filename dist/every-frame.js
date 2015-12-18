require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/cameron/Desktop/HoverCards/deckard/app/every-frame.js":[function(require,module,exports){
require('./hovercard/every-frame.js');require('./lightbox/every-frame.js');

},{"./hovercard/every-frame.js":"/Users/cameron/Desktop/HoverCards/deckard/app/hovercard/every-frame.js","./lightbox/every-frame.js":"/Users/cameron/Desktop/HoverCards/deckard/app/lightbox/every-frame.js"}],"/Users/cameron/Desktop/HoverCards/deckard/app/lightbox/every-frame.js":[function(require,module,exports){
if (window !== window.top) {
	var $ = require('jquery');
	var _ = require('underscore');
	require('../common/mixins');
	require('./both');

	var EXTENSION_ID = chrome.i18n.getMessage('@@extension_id');

	var NameSpace = '.' + EXTENSION_ID;

	var Click = 'click' + NameSpace;

	$.lightbox = function(identity) {
		window.top.postMessage({ msg: _.prefix('lightbox'), identity: identity }, '*');
	};

	$('html').on(Click, '.' + _.prefix('hovercard__box'), function() {
		$(this).parents('.' + _.prefix('hovercard')).remove();
	});
}

},{"../common/mixins":"/Users/cameron/Desktop/HoverCards/deckard/app/common/mixins.js","./both":"/Users/cameron/Desktop/HoverCards/deckard/app/lightbox/both.js","jquery":"/Users/cameron/Desktop/HoverCards/deckard/node_modules/jquery/dist/jquery.js","underscore":"/Users/cameron/.nvm/versions/node/v4.1.1/lib/node_modules/underscore/underscore.js"}],"/Users/cameron/Desktop/HoverCards/deckard/app/hovercard/every-frame.js":[function(require,module,exports){
var $                = require('jquery');
var _                = require('underscore');
var analytics        = require('../analytics');
var config           = require('../config');
var template_loading = require('../template_loading');
var urls             = require('hovercardsshared/urls');
require('../common/mixins');

var HOVERABLE_THINGS = [
	{ selector: 'a[href]:not(.no-hovercard,.hoverZoomLink,[data-href],[data-expanded-url])',          get_url: function(link) { return link.attr('href'); } },
	{ selector: 'a[data-href]:not(.no-hovercard,.hoverZoomLink,[data-expanded-url])',                 get_url: function(link) { return link.data('href'); } },
	{ selector: 'a[data-expanded-url]:not(.no-hovercard,.hoverZoomLink,[data-href])',                 get_url: function(link) { return link.data('expanded-url'); } },
	{ selector: 'a[data-full-url]:not(.no-hovercard,.hoverZoomLink,[data-href],[data-expanded-url])', get_url: function(link) { return link.data('full-url'); } },
	// FIXME Twitter follow button hack
	{ selector: 'iframe.twitter-follow-button:not(.no-hovercard)',                                    get_url: function(iframe) {
		var match = iframe.attr('src').match(/[?&]screen_name=([a-zA-Z0-9_]+)(?:&|$)/);
		if (!match || !match[1]) {
			return;
		}
		return 'https://twitter.com/' + match[1];
	} },
];

var EXTENSION_ID           = chrome.i18n.getMessage('@@extension_id');
var PADDING_FROM_EDGES     = 10;
var TIMEOUT_BEFORE_CARD    = 500;
var TIMEOUT_BEFORE_FADEOUT = 100;

var NameSpace = '.' + EXTENSION_ID;

var Blur       = 'blur' + NameSpace;
var Cleanup    = 'cleanup' + NameSpace;
var Click      = 'click' + NameSpace;
var MouseLeave = 'mouseleave' + NameSpace;
var MouseMove  = 'mousemove' + NameSpace + ' mouseenter' + NameSpace;

var current_obj;

var disabled;
// FIXME Maybe move this out into its own "feature"
chrome.storage.sync.get('disabled', function(obj) {
	disabled = obj.disabled || {};

	chrome.storage.onChanged.addListener(function(changes, area_name) {
		if (area_name !== 'sync' || !('disabled' in changes)) {
			return;
		}
		disabled = changes.disabled.newValue;
	});
});
function accept_identity(identity, obj) {
	if (!disabled || (disabled[identity.api] && disabled[identity.api][identity.type]) || !config.apis[identity.api]) {
		return false;
	}
	return identity.api !== document.domain.replace(/\.com$/, '').replace(/^.*\./, '') ||
	       (identity.api === 'imgur'     && identity.type === 'account' && !obj.is('.account-user-name') && !obj.parents('.options,.user-dropdown').length) ||
	       (identity.api === 'instagram' && identity.type === 'account' && !obj.is('.-cx-PRIVATE-Navigation__menuLink') && !obj.parents('.dropdown').length) ||
	       (identity.api === 'reddit'    && (identity.type === 'account' ? !$('body.res').length && !obj.parents('.tabmenu,.user').length :
	                                                                       obj.parents('.usertext-body,.search-result-body').length)) ||
	       (identity.api === 'twitter'   && identity.type === 'account' && document.domain === 'tweetdeck.twitter.com');
}
function massage_url(url) {
	if (!url) {
		return null;
	}
	if (url === '#') {
		return null;
	}
	if (url.match(/^javascript:.*/)) {
		return null;
	}
	var a = document.createElement('a');
	a.href = url;
	url = a.href;
	a.href = '';
	if (a.remove) {
		a.remove();
	}
	if (url === document.URL + '#') {
		return null;
	}
	return url;
}

function make_hovercard(obj, identity, e) {
	if (!_.isObject(identity)) {
		return;
	}
	var analytics_label = _.analytics_label(identity);
	analytics('send', 'event', 'hovercard displayed', 'link hovered', analytics_label, { nonInteraction: true });
	var hovercard_start = Date.now();
	var hovercard__box = $('<div></div>')
		.addClass(_.prefix('box'))
		.addClass(_.prefix('hovercard__box'))
		.one(Click, function(e) {
			e.preventDefault();
			obj.trigger(Cleanup, [true]);
		});

	var hovercard = $('<div></div>')
		.addClass(_.prefix('hovercard'))
		.data(_.prefix('identity'), identity)
		.append(hovercard__box)
		.appendTo('html');

	var ractive = template_loading(hovercard__box, identity);
	var is_top;
	function position_hovercard() {
		var obj_offset = obj.offset();
		is_top = obj_offset.top - hovercard__box.height() - PADDING_FROM_EDGES > $(window).scrollTop();
		hovercard
			.toggleClass(_.prefix('hovercard_from_top'), is_top)
			.toggleClass(_.prefix('hovercard_from_bottom'), !is_top)
			.offset({ top:  obj_offset.top + (!is_top && obj.height()),
			          left: Math.max(PADDING_FROM_EDGES,
			                         Math.min($(window).scrollLeft() + $(window).width() - hovercard__box.width() - PADDING_FROM_EDGES,
			                                  (e ? e.pageX : obj_offset.left) + 1)) });
	}
	position_hovercard();
	var observe_loading = ractive.observeUntil((identity.type === 'content' ? 'content' : 'accounts.0') + '.loaded', function() {
		if (!is_top) {
			return;
		}
		position_hovercard();
	}, { defer: true });


	function kill_it() {
		obj.trigger(Cleanup);
	}
	$(window).on(Blur, kill_it);
	obj
		.one(Click, kill_it)
		.one(Cleanup, function(e, keep_hovercard) {
			// analytics('send', 'timing', 'hovercard', 'showing', Date.now() - hovercard_start, analytics_label);
			// observe_loading.cancel();
			// if (keep_hovercard) {
			// 	hovercard__box
			// 		.removeClass(_.prefix('hovercard_from_top'))
			// 		.removeClass(_.prefix('hovercard_from_bottom'));
			// } else {
			// 	hovercard.remove();
			// }
			// $(window).off(Blur, kill_it);
			// obj.off(NameSpace);
			// current_obj = !current_obj.is(obj) && current_obj;
		});
	var both = obj.add(hovercard__box);
	both.on(MouseLeave, function(e) {
		var to = $(e.toElement);
		if (both.is(to) || both.has(to).length) {
			return;
		}
		var kill_timeout = setTimeout(kill_it, TIMEOUT_BEFORE_FADEOUT);
		both.one(MouseMove, function() {
			clearTimeout(kill_timeout);
		});
	});
}

HOVERABLE_THINGS.forEach(function(hoverable) {
	$('html').on(MouseMove, hoverable.selector, function(e) {
		var obj = $(this);
		var url;
		var identity;
		if (obj.is(current_obj) || obj.has(current_obj).length ||
		    obj.parents('.' + _.prefix('hovercard')).length ||
		    !(url = massage_url(hoverable.get_url(obj))) ||
		    !(identity = urls.parse(url)) ||
		    !accept_identity(identity, obj)) {
			return;
		}
		if (current_obj) {
			current_obj.trigger(Cleanup);
		}
		var last_e = e;
		var timeout = setTimeout(function() {
			obj.trigger(Cleanup);
			make_hovercard(obj, identity, last_e);
		}, TIMEOUT_BEFORE_CARD);
		function kill_it() {
			obj.trigger(Cleanup);
			if (current_obj) {
				current_obj = !current_obj.is(obj) && current_obj;
			}
		}
		$(window).on(Blur, kill_it);
		current_obj = obj
			.one(Click + ' ' + MouseLeave, kill_it)
			.one(Cleanup, function() {
				$(window).off(Blur, kill_it);
				obj.off(NameSpace);
				clearTimeout(timeout);
				timeout = null;
			})
			.on(MouseMove, function(e) {
				last_e = e;
			});
	});
});

},{"../analytics":"/Users/cameron/Desktop/HoverCards/deckard/app/analytics/index.js","../common/mixins":"/Users/cameron/Desktop/HoverCards/deckard/app/common/mixins.js","../config":"/Users/cameron/Desktop/HoverCards/deckard/app/config.js","../template_loading":"/Users/cameron/Desktop/HoverCards/deckard/app/template_loading/index.js","hovercardsshared/urls":"/Users/cameron/Desktop/HoverCards/hovercardsshared/urls/index.js","jquery":"/Users/cameron/Desktop/HoverCards/deckard/node_modules/jquery/dist/jquery.js","underscore":"/Users/cameron/.nvm/versions/node/v4.1.1/lib/node_modules/underscore/underscore.js"}]},{},["/Users/cameron/Desktop/HoverCards/deckard/app/every-frame.js"])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvZXZlcnktZnJhbWUuanMiLCJhcHAvbGlnaHRib3gvZXZlcnktZnJhbWUuanMiLCJhcHAvaG92ZXJjYXJkL2V2ZXJ5LWZyYW1lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJyZXF1aXJlKCcuL2hvdmVyY2FyZC9ldmVyeS1mcmFtZS5qcycpO3JlcXVpcmUoJy4vbGlnaHRib3gvZXZlcnktZnJhbWUuanMnKTtcbiIsImlmICh3aW5kb3cgIT09IHdpbmRvdy50b3ApIHtcblx0dmFyICQgPSByZXF1aXJlKCdqcXVlcnknKTtcblx0dmFyIF8gPSByZXF1aXJlKCd1bmRlcnNjb3JlJyk7XG5cdHJlcXVpcmUoJy4uL2NvbW1vbi9taXhpbnMnKTtcblx0cmVxdWlyZSgnLi9ib3RoJyk7XG5cblx0dmFyIEVYVEVOU0lPTl9JRCA9IGNocm9tZS5pMThuLmdldE1lc3NhZ2UoJ0BAZXh0ZW5zaW9uX2lkJyk7XG5cblx0dmFyIE5hbWVTcGFjZSA9ICcuJyArIEVYVEVOU0lPTl9JRDtcblxuXHR2YXIgQ2xpY2sgPSAnY2xpY2snICsgTmFtZVNwYWNlO1xuXG5cdCQubGlnaHRib3ggPSBmdW5jdGlvbihpZGVudGl0eSkge1xuXHRcdHdpbmRvdy50b3AucG9zdE1lc3NhZ2UoeyBtc2c6IF8ucHJlZml4KCdsaWdodGJveCcpLCBpZGVudGl0eTogaWRlbnRpdHkgfSwgJyonKTtcblx0fTtcblxuXHQkKCdodG1sJykub24oQ2xpY2ssICcuJyArIF8ucHJlZml4KCdob3ZlcmNhcmRfX2JveCcpLCBmdW5jdGlvbigpIHtcblx0XHQkKHRoaXMpLnBhcmVudHMoJy4nICsgXy5wcmVmaXgoJ2hvdmVyY2FyZCcpKS5yZW1vdmUoKTtcblx0fSk7XG59XG4iLCJ2YXIgJCAgICAgICAgICAgICAgICA9IHJlcXVpcmUoJ2pxdWVyeScpO1xudmFyIF8gICAgICAgICAgICAgICAgPSByZXF1aXJlKCd1bmRlcnNjb3JlJyk7XG52YXIgYW5hbHl0aWNzICAgICAgICA9IHJlcXVpcmUoJy4uL2FuYWx5dGljcycpO1xudmFyIGNvbmZpZyAgICAgICAgICAgPSByZXF1aXJlKCcuLi9jb25maWcnKTtcbnZhciB0ZW1wbGF0ZV9sb2FkaW5nID0gcmVxdWlyZSgnLi4vdGVtcGxhdGVfbG9hZGluZycpO1xudmFyIHVybHMgICAgICAgICAgICAgPSByZXF1aXJlKCdob3ZlcmNhcmRzc2hhcmVkL3VybHMnKTtcbnJlcXVpcmUoJy4uL2NvbW1vbi9taXhpbnMnKTtcblxudmFyIEhPVkVSQUJMRV9USElOR1MgPSBbXG5cdHsgc2VsZWN0b3I6ICdhW2hyZWZdOm5vdCgubm8taG92ZXJjYXJkLC5ob3Zlclpvb21MaW5rLFtkYXRhLWhyZWZdLFtkYXRhLWV4cGFuZGVkLXVybF0pJywgICAgICAgICAgZ2V0X3VybDogZnVuY3Rpb24obGluaykgeyByZXR1cm4gbGluay5hdHRyKCdocmVmJyk7IH0gfSxcblx0eyBzZWxlY3RvcjogJ2FbZGF0YS1ocmVmXTpub3QoLm5vLWhvdmVyY2FyZCwuaG92ZXJab29tTGluayxbZGF0YS1leHBhbmRlZC11cmxdKScsICAgICAgICAgICAgICAgICBnZXRfdXJsOiBmdW5jdGlvbihsaW5rKSB7IHJldHVybiBsaW5rLmRhdGEoJ2hyZWYnKTsgfSB9LFxuXHR7IHNlbGVjdG9yOiAnYVtkYXRhLWV4cGFuZGVkLXVybF06bm90KC5uby1ob3ZlcmNhcmQsLmhvdmVyWm9vbUxpbmssW2RhdGEtaHJlZl0pJywgICAgICAgICAgICAgICAgIGdldF91cmw6IGZ1bmN0aW9uKGxpbmspIHsgcmV0dXJuIGxpbmsuZGF0YSgnZXhwYW5kZWQtdXJsJyk7IH0gfSxcblx0eyBzZWxlY3RvcjogJ2FbZGF0YS1mdWxsLXVybF06bm90KC5uby1ob3ZlcmNhcmQsLmhvdmVyWm9vbUxpbmssW2RhdGEtaHJlZl0sW2RhdGEtZXhwYW5kZWQtdXJsXSknLCBnZXRfdXJsOiBmdW5jdGlvbihsaW5rKSB7IHJldHVybiBsaW5rLmRhdGEoJ2Z1bGwtdXJsJyk7IH0gfSxcblx0Ly8gRklYTUUgVHdpdHRlciBmb2xsb3cgYnV0dG9uIGhhY2tcblx0eyBzZWxlY3RvcjogJ2lmcmFtZS50d2l0dGVyLWZvbGxvdy1idXR0b246bm90KC5uby1ob3ZlcmNhcmQpJywgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBnZXRfdXJsOiBmdW5jdGlvbihpZnJhbWUpIHtcblx0XHR2YXIgbWF0Y2ggPSBpZnJhbWUuYXR0cignc3JjJykubWF0Y2goL1s/Jl1zY3JlZW5fbmFtZT0oW2EtekEtWjAtOV9dKykoPzomfCQpLyk7XG5cdFx0aWYgKCFtYXRjaCB8fCAhbWF0Y2hbMV0pIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0cmV0dXJuICdodHRwczovL3R3aXR0ZXIuY29tLycgKyBtYXRjaFsxXTtcblx0fSB9LFxuXTtcblxudmFyIEVYVEVOU0lPTl9JRCAgICAgICAgICAgPSBjaHJvbWUuaTE4bi5nZXRNZXNzYWdlKCdAQGV4dGVuc2lvbl9pZCcpO1xudmFyIFBBRERJTkdfRlJPTV9FREdFUyAgICAgPSAxMDtcbnZhciBUSU1FT1VUX0JFRk9SRV9DQVJEICAgID0gNTAwO1xudmFyIFRJTUVPVVRfQkVGT1JFX0ZBREVPVVQgPSAxMDA7XG5cbnZhciBOYW1lU3BhY2UgPSAnLicgKyBFWFRFTlNJT05fSUQ7XG5cbnZhciBCbHVyICAgICAgID0gJ2JsdXInICsgTmFtZVNwYWNlO1xudmFyIENsZWFudXAgICAgPSAnY2xlYW51cCcgKyBOYW1lU3BhY2U7XG52YXIgQ2xpY2sgICAgICA9ICdjbGljaycgKyBOYW1lU3BhY2U7XG52YXIgTW91c2VMZWF2ZSA9ICdtb3VzZWxlYXZlJyArIE5hbWVTcGFjZTtcbnZhciBNb3VzZU1vdmUgID0gJ21vdXNlbW92ZScgKyBOYW1lU3BhY2UgKyAnIG1vdXNlZW50ZXInICsgTmFtZVNwYWNlO1xuXG52YXIgY3VycmVudF9vYmo7XG5cbnZhciBkaXNhYmxlZDtcbi8vIEZJWE1FIE1heWJlIG1vdmUgdGhpcyBvdXQgaW50byBpdHMgb3duIFwiZmVhdHVyZVwiXG5jaHJvbWUuc3RvcmFnZS5zeW5jLmdldCgnZGlzYWJsZWQnLCBmdW5jdGlvbihvYmopIHtcblx0ZGlzYWJsZWQgPSBvYmouZGlzYWJsZWQgfHwge307XG5cblx0Y2hyb21lLnN0b3JhZ2Uub25DaGFuZ2VkLmFkZExpc3RlbmVyKGZ1bmN0aW9uKGNoYW5nZXMsIGFyZWFfbmFtZSkge1xuXHRcdGlmIChhcmVhX25hbWUgIT09ICdzeW5jJyB8fCAhKCdkaXNhYmxlZCcgaW4gY2hhbmdlcykpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0ZGlzYWJsZWQgPSBjaGFuZ2VzLmRpc2FibGVkLm5ld1ZhbHVlO1xuXHR9KTtcbn0pO1xuZnVuY3Rpb24gYWNjZXB0X2lkZW50aXR5KGlkZW50aXR5LCBvYmopIHtcblx0aWYgKCFkaXNhYmxlZCB8fCAoZGlzYWJsZWRbaWRlbnRpdHkuYXBpXSAmJiBkaXNhYmxlZFtpZGVudGl0eS5hcGldW2lkZW50aXR5LnR5cGVdKSB8fCAhY29uZmlnLmFwaXNbaWRlbnRpdHkuYXBpXSkge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXHRyZXR1cm4gaWRlbnRpdHkuYXBpICE9PSBkb2N1bWVudC5kb21haW4ucmVwbGFjZSgvXFwuY29tJC8sICcnKS5yZXBsYWNlKC9eLipcXC4vLCAnJykgfHxcblx0ICAgICAgIChpZGVudGl0eS5hcGkgPT09ICdpbWd1cicgICAgICYmIGlkZW50aXR5LnR5cGUgPT09ICdhY2NvdW50JyAmJiAhb2JqLmlzKCcuYWNjb3VudC11c2VyLW5hbWUnKSAmJiAhb2JqLnBhcmVudHMoJy5vcHRpb25zLC51c2VyLWRyb3Bkb3duJykubGVuZ3RoKSB8fFxuXHQgICAgICAgKGlkZW50aXR5LmFwaSA9PT0gJ2luc3RhZ3JhbScgJiYgaWRlbnRpdHkudHlwZSA9PT0gJ2FjY291bnQnICYmICFvYmouaXMoJy4tY3gtUFJJVkFURS1OYXZpZ2F0aW9uX19tZW51TGluaycpICYmICFvYmoucGFyZW50cygnLmRyb3Bkb3duJykubGVuZ3RoKSB8fFxuXHQgICAgICAgKGlkZW50aXR5LmFwaSA9PT0gJ3JlZGRpdCcgICAgJiYgKGlkZW50aXR5LnR5cGUgPT09ICdhY2NvdW50JyA/ICEkKCdib2R5LnJlcycpLmxlbmd0aCAmJiAhb2JqLnBhcmVudHMoJy50YWJtZW51LC51c2VyJykubGVuZ3RoIDpcblx0ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvYmoucGFyZW50cygnLnVzZXJ0ZXh0LWJvZHksLnNlYXJjaC1yZXN1bHQtYm9keScpLmxlbmd0aCkpIHx8XG5cdCAgICAgICAoaWRlbnRpdHkuYXBpID09PSAndHdpdHRlcicgICAmJiBpZGVudGl0eS50eXBlID09PSAnYWNjb3VudCcgJiYgZG9jdW1lbnQuZG9tYWluID09PSAndHdlZXRkZWNrLnR3aXR0ZXIuY29tJyk7XG59XG5mdW5jdGlvbiBtYXNzYWdlX3VybCh1cmwpIHtcblx0aWYgKCF1cmwpIHtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXHRpZiAodXJsID09PSAnIycpIHtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXHRpZiAodXJsLm1hdGNoKC9eamF2YXNjcmlwdDouKi8pKSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblx0dmFyIGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG5cdGEuaHJlZiA9IHVybDtcblx0dXJsID0gYS5ocmVmO1xuXHRhLmhyZWYgPSAnJztcblx0aWYgKGEucmVtb3ZlKSB7XG5cdFx0YS5yZW1vdmUoKTtcblx0fVxuXHRpZiAodXJsID09PSBkb2N1bWVudC5VUkwgKyAnIycpIHtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXHRyZXR1cm4gdXJsO1xufVxuXG5mdW5jdGlvbiBtYWtlX2hvdmVyY2FyZChvYmosIGlkZW50aXR5LCBlKSB7XG5cdGlmICghXy5pc09iamVjdChpZGVudGl0eSkpIHtcblx0XHRyZXR1cm47XG5cdH1cblx0dmFyIGFuYWx5dGljc19sYWJlbCA9IF8uYW5hbHl0aWNzX2xhYmVsKGlkZW50aXR5KTtcblx0YW5hbHl0aWNzKCdzZW5kJywgJ2V2ZW50JywgJ2hvdmVyY2FyZCBkaXNwbGF5ZWQnLCAnbGluayBob3ZlcmVkJywgYW5hbHl0aWNzX2xhYmVsLCB7IG5vbkludGVyYWN0aW9uOiB0cnVlIH0pO1xuXHR2YXIgaG92ZXJjYXJkX3N0YXJ0ID0gRGF0ZS5ub3coKTtcblx0dmFyIGhvdmVyY2FyZF9fYm94ID0gJCgnPGRpdj48L2Rpdj4nKVxuXHRcdC5hZGRDbGFzcyhfLnByZWZpeCgnYm94JykpXG5cdFx0LmFkZENsYXNzKF8ucHJlZml4KCdob3ZlcmNhcmRfX2JveCcpKVxuXHRcdC5vbmUoQ2xpY2ssIGZ1bmN0aW9uKGUpIHtcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdG9iai50cmlnZ2VyKENsZWFudXAsIFt0cnVlXSk7XG5cdFx0fSk7XG5cblx0dmFyIGhvdmVyY2FyZCA9ICQoJzxkaXY+PC9kaXY+Jylcblx0XHQuYWRkQ2xhc3MoXy5wcmVmaXgoJ2hvdmVyY2FyZCcpKVxuXHRcdC5kYXRhKF8ucHJlZml4KCdpZGVudGl0eScpLCBpZGVudGl0eSlcblx0XHQuYXBwZW5kKGhvdmVyY2FyZF9fYm94KVxuXHRcdC5hcHBlbmRUbygnaHRtbCcpO1xuXG5cdHZhciByYWN0aXZlID0gdGVtcGxhdGVfbG9hZGluZyhob3ZlcmNhcmRfX2JveCwgaWRlbnRpdHkpO1xuXHR2YXIgaXNfdG9wO1xuXHRmdW5jdGlvbiBwb3NpdGlvbl9ob3ZlcmNhcmQoKSB7XG5cdFx0dmFyIG9ial9vZmZzZXQgPSBvYmoub2Zmc2V0KCk7XG5cdFx0aXNfdG9wID0gb2JqX29mZnNldC50b3AgLSBob3ZlcmNhcmRfX2JveC5oZWlnaHQoKSAtIFBBRERJTkdfRlJPTV9FREdFUyA+ICQod2luZG93KS5zY3JvbGxUb3AoKTtcblx0XHRob3ZlcmNhcmRcblx0XHRcdC50b2dnbGVDbGFzcyhfLnByZWZpeCgnaG92ZXJjYXJkX2Zyb21fdG9wJyksIGlzX3RvcClcblx0XHRcdC50b2dnbGVDbGFzcyhfLnByZWZpeCgnaG92ZXJjYXJkX2Zyb21fYm90dG9tJyksICFpc190b3ApXG5cdFx0XHQub2Zmc2V0KHsgdG9wOiAgb2JqX29mZnNldC50b3AgKyAoIWlzX3RvcCAmJiBvYmouaGVpZ2h0KCkpLFxuXHRcdFx0ICAgICAgICAgIGxlZnQ6IE1hdGgubWF4KFBBRERJTkdfRlJPTV9FREdFUyxcblx0XHRcdCAgICAgICAgICAgICAgICAgICAgICAgICBNYXRoLm1pbigkKHdpbmRvdykuc2Nyb2xsTGVmdCgpICsgJCh3aW5kb3cpLndpZHRoKCkgLSBob3ZlcmNhcmRfX2JveC53aWR0aCgpIC0gUEFERElOR19GUk9NX0VER0VTLFxuXHRcdFx0ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChlID8gZS5wYWdlWCA6IG9ial9vZmZzZXQubGVmdCkgKyAxKSkgfSk7XG5cdH1cblx0cG9zaXRpb25faG92ZXJjYXJkKCk7XG5cdHZhciBvYnNlcnZlX2xvYWRpbmcgPSByYWN0aXZlLm9ic2VydmVVbnRpbCgoaWRlbnRpdHkudHlwZSA9PT0gJ2NvbnRlbnQnID8gJ2NvbnRlbnQnIDogJ2FjY291bnRzLjAnKSArICcubG9hZGVkJywgZnVuY3Rpb24oKSB7XG5cdFx0aWYgKCFpc190b3ApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0cG9zaXRpb25faG92ZXJjYXJkKCk7XG5cdH0sIHsgZGVmZXI6IHRydWUgfSk7XG5cblxuXHRmdW5jdGlvbiBraWxsX2l0KCkge1xuXHRcdG9iai50cmlnZ2VyKENsZWFudXApO1xuXHR9XG5cdCQod2luZG93KS5vbihCbHVyLCBraWxsX2l0KTtcblx0b2JqXG5cdFx0Lm9uZShDbGljaywga2lsbF9pdClcblx0XHQub25lKENsZWFudXAsIGZ1bmN0aW9uKGUsIGtlZXBfaG92ZXJjYXJkKSB7XG5cdFx0XHQvLyBhbmFseXRpY3MoJ3NlbmQnLCAndGltaW5nJywgJ2hvdmVyY2FyZCcsICdzaG93aW5nJywgRGF0ZS5ub3coKSAtIGhvdmVyY2FyZF9zdGFydCwgYW5hbHl0aWNzX2xhYmVsKTtcblx0XHRcdC8vIG9ic2VydmVfbG9hZGluZy5jYW5jZWwoKTtcblx0XHRcdC8vIGlmIChrZWVwX2hvdmVyY2FyZCkge1xuXHRcdFx0Ly8gXHRob3ZlcmNhcmRfX2JveFxuXHRcdFx0Ly8gXHRcdC5yZW1vdmVDbGFzcyhfLnByZWZpeCgnaG92ZXJjYXJkX2Zyb21fdG9wJykpXG5cdFx0XHQvLyBcdFx0LnJlbW92ZUNsYXNzKF8ucHJlZml4KCdob3ZlcmNhcmRfZnJvbV9ib3R0b20nKSk7XG5cdFx0XHQvLyB9IGVsc2Uge1xuXHRcdFx0Ly8gXHRob3ZlcmNhcmQucmVtb3ZlKCk7XG5cdFx0XHQvLyB9XG5cdFx0XHQvLyAkKHdpbmRvdykub2ZmKEJsdXIsIGtpbGxfaXQpO1xuXHRcdFx0Ly8gb2JqLm9mZihOYW1lU3BhY2UpO1xuXHRcdFx0Ly8gY3VycmVudF9vYmogPSAhY3VycmVudF9vYmouaXMob2JqKSAmJiBjdXJyZW50X29iajtcblx0XHR9KTtcblx0dmFyIGJvdGggPSBvYmouYWRkKGhvdmVyY2FyZF9fYm94KTtcblx0Ym90aC5vbihNb3VzZUxlYXZlLCBmdW5jdGlvbihlKSB7XG5cdFx0dmFyIHRvID0gJChlLnRvRWxlbWVudCk7XG5cdFx0aWYgKGJvdGguaXModG8pIHx8IGJvdGguaGFzKHRvKS5sZW5ndGgpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0dmFyIGtpbGxfdGltZW91dCA9IHNldFRpbWVvdXQoa2lsbF9pdCwgVElNRU9VVF9CRUZPUkVfRkFERU9VVCk7XG5cdFx0Ym90aC5vbmUoTW91c2VNb3ZlLCBmdW5jdGlvbigpIHtcblx0XHRcdGNsZWFyVGltZW91dChraWxsX3RpbWVvdXQpO1xuXHRcdH0pO1xuXHR9KTtcbn1cblxuSE9WRVJBQkxFX1RISU5HUy5mb3JFYWNoKGZ1bmN0aW9uKGhvdmVyYWJsZSkge1xuXHQkKCdodG1sJykub24oTW91c2VNb3ZlLCBob3ZlcmFibGUuc2VsZWN0b3IsIGZ1bmN0aW9uKGUpIHtcblx0XHR2YXIgb2JqID0gJCh0aGlzKTtcblx0XHR2YXIgdXJsO1xuXHRcdHZhciBpZGVudGl0eTtcblx0XHRpZiAob2JqLmlzKGN1cnJlbnRfb2JqKSB8fCBvYmouaGFzKGN1cnJlbnRfb2JqKS5sZW5ndGggfHxcblx0XHQgICAgb2JqLnBhcmVudHMoJy4nICsgXy5wcmVmaXgoJ2hvdmVyY2FyZCcpKS5sZW5ndGggfHxcblx0XHQgICAgISh1cmwgPSBtYXNzYWdlX3VybChob3ZlcmFibGUuZ2V0X3VybChvYmopKSkgfHxcblx0XHQgICAgIShpZGVudGl0eSA9IHVybHMucGFyc2UodXJsKSkgfHxcblx0XHQgICAgIWFjY2VwdF9pZGVudGl0eShpZGVudGl0eSwgb2JqKSkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRpZiAoY3VycmVudF9vYmopIHtcblx0XHRcdGN1cnJlbnRfb2JqLnRyaWdnZXIoQ2xlYW51cCk7XG5cdFx0fVxuXHRcdHZhciBsYXN0X2UgPSBlO1xuXHRcdHZhciB0aW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdG9iai50cmlnZ2VyKENsZWFudXApO1xuXHRcdFx0bWFrZV9ob3ZlcmNhcmQob2JqLCBpZGVudGl0eSwgbGFzdF9lKTtcblx0XHR9LCBUSU1FT1VUX0JFRk9SRV9DQVJEKTtcblx0XHRmdW5jdGlvbiBraWxsX2l0KCkge1xuXHRcdFx0b2JqLnRyaWdnZXIoQ2xlYW51cCk7XG5cdFx0XHRpZiAoY3VycmVudF9vYmopIHtcblx0XHRcdFx0Y3VycmVudF9vYmogPSAhY3VycmVudF9vYmouaXMob2JqKSAmJiBjdXJyZW50X29iajtcblx0XHRcdH1cblx0XHR9XG5cdFx0JCh3aW5kb3cpLm9uKEJsdXIsIGtpbGxfaXQpO1xuXHRcdGN1cnJlbnRfb2JqID0gb2JqXG5cdFx0XHQub25lKENsaWNrICsgJyAnICsgTW91c2VMZWF2ZSwga2lsbF9pdClcblx0XHRcdC5vbmUoQ2xlYW51cCwgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdCQod2luZG93KS5vZmYoQmx1ciwga2lsbF9pdCk7XG5cdFx0XHRcdG9iai5vZmYoTmFtZVNwYWNlKTtcblx0XHRcdFx0Y2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuXHRcdFx0XHR0aW1lb3V0ID0gbnVsbDtcblx0XHRcdH0pXG5cdFx0XHQub24oTW91c2VNb3ZlLCBmdW5jdGlvbihlKSB7XG5cdFx0XHRcdGxhc3RfZSA9IGU7XG5cdFx0XHR9KTtcblx0fSk7XG59KTtcbiJdfQ==
