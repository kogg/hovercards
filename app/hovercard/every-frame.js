var $                = require('jquery');
var _                = require('underscore');
var analytics        = require('../analytics');
var config           = require('../config');
var template_loading = require('../template_loading');
var urls             = require('hovercardsshared/urls');
require('../common/mixins');

var HOVERABLE_THINGS = [
	{
		selector: 'a[href]:not(.no-hovercard,.hoverZoomLink,[data-href],[data-expanded-url])',
		get_url:  function(link) {
			return link.attr('href');
		}
	},
	{
		selector: 'a[data-href]:not(.no-hovercard,.hoverZoomLink,[data-expanded-url])',
		get_url:  function(link) {
			return link.data('href');
		}
	},
	{
		selector: 'a[data-expanded-url]:not(.no-hovercard,.hoverZoomLink,[data-href])',
		get_url:  function(link) {
			return link.data('expanded-url');
		}
	},
	{
		selector: 'a[data-full-url]:not(.no-hovercard,.hoverZoomLink,[data-href],[data-expanded-url])',
		get_url:  function(link) {
			return link.data('full-url');
		}
	},
	// FIXME Twitter follow button hack
	{
		selector: 'iframe.twitter-follow-button:not(.no-hovercard)',
		get_url:  function(iframe) {
			var match = iframe.attr('src').match(/[?&]screen_name=([a-zA-Z0-9_]+)(?:&|$)/);
			if (!match || !match[1]) {
				return null;
			}
			return 'https://twitter.com/' + match[1];
		}
	}
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
var Scroll     = 'scroll' + NameSpace;

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
	return identity.api !== document.domain.replace(/\.com$/, '').replace(/^.*\./, '') || (identity.api === 'imgur' && identity.type === 'account' && !obj.is('.account-user-name') && !obj.parents('.options,.user-dropdown').length) || (identity.api === 'instagram' && identity.type === 'account' && !obj.is('.-cx-PRIVATE-Navigation__menuLink') && !obj.parents('.dropdown').length) || (identity.api === 'reddit' && (identity.type === 'account' ? !$('body.res').length && !obj.parents('.tabmenu,.user').length : obj.parents('.usertext-body,.search-result-body').length)) || (identity.api === 'twitter' && identity.type === 'account' && document.domain === 'tweetdeck.twitter.com');
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
		.addClass(_.prefix('hovercard__box'));

	var hovercard = $('<div></div>')
		.addClass(_.prefix('hovercard'))
		.data(_.prefix('identity'), identity)
		.append(hovercard__box)
		.appendTo('html');

	var left, top, commentPixels;

	function setCommentPixels() {
		var discussion_top = _.result(hovercard__box.find('.' + _.prefix('discussion__body')).offset(), 'top');

		if (!discussion_top) {
			return;
		}

		var newCommentPixels = top - discussion_top + hovercard__box.height();

		if (!Math.max(0, newCommentPixels || 0)) {
			return;
		}
		commentPixels = Math.max(newCommentPixels, commentPixels || 0);
	}

	var ractive = template_loading(hovercard__box, identity);
	hovercard__box
		.on(Scroll, setCommentPixels)
		.on(MouseMove, function() {
			ractive.set('hovered', true);
			$('body,html').addClass(_.prefix('hide-scrollbar'));
			$('body').addClass(_.prefix('overflow-hidden'));
		})
		.on(MouseLeave, function() {
			ractive.set('hovered', false);
			$('body,html').removeClass(_.prefix('hide-scrollbar'));
			$('body').removeClass(_.prefix('overflow-hidden'));
		});

	var obj_offset         = obj.offset();
	var pos_left           = e ? e.pageX : obj_offset.left;
	var pos_top            = e ? e.pageY : (obj_offset.top + obj.height() / 2);
	var window_innerHeight = window.innerHeight;
	var window_innerWidth  = window.innerWidth;
	var window_scrollLeft  = $(window).scrollLeft();
	var window_scrollTop   = $(window).scrollTop();
	function position_hovercard() {
		var hovercard__box_height = hovercard__box.height();
		var hovercard__box_width  = hovercard__box.width();

		var new_left = Math.max(
			window_scrollLeft + PADDING_FROM_EDGES, // Keep the hovercard from going off the left of the page
			pos_left + (
				(pos_left + 1 > window_scrollLeft + window_innerWidth - hovercard__box_width - PADDING_FROM_EDGES)
					? - hovercard__box_width - 1 // Keep the hovercard from going off the right of the page by putting it on the left
					: 1 // Put the hovercard on the right
			)
		);
		var new_top = Math.max(
			window_scrollTop + PADDING_FROM_EDGES, // Keep the hovercard from going off the top of the page
			Math.min(
				window_scrollTop + window_innerHeight - hovercard__box_height - PADDING_FROM_EDGES, // Keep the hovercard from going off the bottom of the page
				pos_top - Math.min(
					hovercard__box_height / 2, // Keep the hovercard from being above the cursor
					70 // Start the hovercard offset above the cursor
				)
			)
		);

		if (left === new_left && top === new_top) {
			return;
		}
		left = new_left;
		top  = new_top;
		hovercard.offset({ left: left, top: top });
		setCommentPixels();
	}
	position_hovercard();
	var position_interval = setInterval(position_hovercard, 250);

	function kill_it() {
		obj.trigger(Cleanup);
	}
	function window_blur() {
		if (document.activeElement.tagName.toLowerCase() === 'iframe' && $(document.activeElement).parents().is(hovercard__box)) {
			return;
		}
		kill_it();
	}
	$(window).on(Blur, window_blur);
	obj
		.one(Click, kill_it)
		.one(Cleanup, function(e, keep_hovercard) {
			if (process.env.NODE_ENV !== 'production' && process.env.STICKYCARDS) {
				return;
			}
			analytics('send', 'timing', 'hovercard', 'showing', Date.now() - hovercard_start, analytics_label);
			if (commentPixels && commentPixels > 0) {
				analytics('send', 'event', 'discussion scrolled', 'scrolled', analytics_label, commentPixels);
			}
			clearInterval(position_interval);
			if (!keep_hovercard) {
				hovercard.remove();
			}
			$('body,html').removeClass(_.prefix('hide-scrollbar'));
			$('body').removeClass(_.prefix('overflow-hidden'));
			$(window).off(Blur, window_blur);
			obj.off(NameSpace);
			current_obj = !current_obj.is(obj) && current_obj;
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
		if (obj.is(current_obj) || obj.has(current_obj).length || obj.parents('.' + _.prefix('hovercard')).length || !(url = massage_url(hoverable.get_url(obj))) || !(identity = urls.parse(url)) || !accept_identity(identity, obj)) {
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
			.one(MouseLeave, kill_it)
			.one(Cleanup, function() {
				$(window).off(Blur, kill_it);
				obj.off(NameSpace);
				clearTimeout(timeout);
				timeout = null;
				$('body,html').removeClass(_.prefix('hide-scrollbar'));
				$('body').removeClass(_.prefix('overflow-hidden'));
			})
			.on(MouseMove, function(e) {
				last_e = e;
			});
	});
});
