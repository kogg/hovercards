require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/cameron/Desktop/HoverCards/deckard/app/options.js":[function(require,module,exports){
var $ = require('jquery');

$(function() {
	chrome.storage.sync.get('disabled', function(obj) {
		var disabled;
		var $save_button = $('#save');

		function set_disabled(new_disabled) {
			disabled = new_disabled;
			$('#imgur-content').prop('checked',      !(disabled && disabled.imgur      && disabled.imgur.content));
			$('#imgur-account').prop('checked',      !(disabled && disabled.imgur      && disabled.imgur.account));
			$('#instagram-content').prop('checked',  !(disabled && disabled.instagram  && disabled.instagram.content));
			$('#instagram-account').prop('checked',  !(disabled && disabled.instagram  && disabled.instagram.account));
			$('#reddit-content').prop('checked',     !(disabled && disabled.reddit     && disabled.reddit.content));
			$('#reddit-account').prop('checked',     !(disabled && disabled.reddit     && disabled.reddit.account));
			$('#soundcloud-content').prop('checked', !(disabled && disabled.soundcloud && disabled.soundcloud.content));
			$('#soundcloud-account').prop('checked', !(disabled && disabled.soundcloud && disabled.soundcloud.account));
			$('#twitter-content').prop('checked',    !(disabled && disabled.twitter    && disabled.twitter.content));
			$('#twitter-account').prop('checked',    !(disabled && disabled.twitter    && disabled.twitter.account));
			$('#youtube-content').prop('checked',    !(disabled && disabled.youtube    && disabled.youtube.content));
			$('#youtube-account').prop('checked',    !(disabled && disabled.youtube    && disabled.youtube.account));
		}
		set_disabled(obj.disabled);

		chrome.storage.onChanged.addListener(function(changes, area_name) {
			if (area_name !== 'sync' || !('disabled' in changes)) {
				return;
			}
			set_disabled(changes.disabled.newValue);
		});

		$('body').on('change', 'input', function() {
			$save_button
				.removeClass('settings-saved')
				.removeClass('settings-error')
				.text('Save My Settings');
		});

		$save_button.on('click', function() {
			$save_button
				.removeClass('settings-saved')
				.removeClass('settings-error')
				.text('Saving...');
			chrome.storage.sync.set({ disabled : { imgur:      { content: !$('#imgur-content').prop('checked'),      account: !$('#imgur-account').prop('checked') },
			                                       instagram:  { content: !$('#instagram-content').prop('checked'),  account: !$('#instagram-account').prop('checked') },
			                                       reddit:     { content: !$('#reddit-content').prop('checked'),     account: !$('#reddit-account').prop('checked') },
			                                       soundcloud: { content: !$('#soundcloud-content').prop('checked'), account: !$('#soundcloud-account').prop('checked') },
			                                       twitter:    { content: !$('#twitter-content').prop('checked'),    account: !$('#twitter-account').prop('checked') },
			                                       youtube:    { content: !$('#youtube-content').prop('checked'),    account: !$('#youtube-account').prop('checked') } } },
				function() {
					if (chrome.runtime.lastError) {
						return $save_button
							.addClass('settings-error')
							.text('Error: ' + chrome.runtime.lastError.message);
					}
					$save_button
						.addClass('settings-saved')
						.text('Saved!');
				});
		});
	});
});

},{"jquery":"/Users/cameron/Desktop/HoverCards/deckard/node_modules/jquery/dist/jquery.js"}]},{},["/Users/cameron/Desktop/HoverCards/deckard/app/options.js"])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvb3B0aW9ucy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgJCA9IHJlcXVpcmUoJ2pxdWVyeScpO1xuXG4kKGZ1bmN0aW9uKCkge1xuXHRjaHJvbWUuc3RvcmFnZS5zeW5jLmdldCgnZGlzYWJsZWQnLCBmdW5jdGlvbihvYmopIHtcblx0XHR2YXIgZGlzYWJsZWQ7XG5cdFx0dmFyICRzYXZlX2J1dHRvbiA9ICQoJyNzYXZlJyk7XG5cblx0XHRmdW5jdGlvbiBzZXRfZGlzYWJsZWQobmV3X2Rpc2FibGVkKSB7XG5cdFx0XHRkaXNhYmxlZCA9IG5ld19kaXNhYmxlZDtcblx0XHRcdCQoJyNpbWd1ci1jb250ZW50JykucHJvcCgnY2hlY2tlZCcsICAgICAgIShkaXNhYmxlZCAmJiBkaXNhYmxlZC5pbWd1ciAgICAgICYmIGRpc2FibGVkLmltZ3VyLmNvbnRlbnQpKTtcblx0XHRcdCQoJyNpbWd1ci1hY2NvdW50JykucHJvcCgnY2hlY2tlZCcsICAgICAgIShkaXNhYmxlZCAmJiBkaXNhYmxlZC5pbWd1ciAgICAgICYmIGRpc2FibGVkLmltZ3VyLmFjY291bnQpKTtcblx0XHRcdCQoJyNpbnN0YWdyYW0tY29udGVudCcpLnByb3AoJ2NoZWNrZWQnLCAgIShkaXNhYmxlZCAmJiBkaXNhYmxlZC5pbnN0YWdyYW0gICYmIGRpc2FibGVkLmluc3RhZ3JhbS5jb250ZW50KSk7XG5cdFx0XHQkKCcjaW5zdGFncmFtLWFjY291bnQnKS5wcm9wKCdjaGVja2VkJywgICEoZGlzYWJsZWQgJiYgZGlzYWJsZWQuaW5zdGFncmFtICAmJiBkaXNhYmxlZC5pbnN0YWdyYW0uYWNjb3VudCkpO1xuXHRcdFx0JCgnI3JlZGRpdC1jb250ZW50JykucHJvcCgnY2hlY2tlZCcsICAgICAhKGRpc2FibGVkICYmIGRpc2FibGVkLnJlZGRpdCAgICAgJiYgZGlzYWJsZWQucmVkZGl0LmNvbnRlbnQpKTtcblx0XHRcdCQoJyNyZWRkaXQtYWNjb3VudCcpLnByb3AoJ2NoZWNrZWQnLCAgICAgIShkaXNhYmxlZCAmJiBkaXNhYmxlZC5yZWRkaXQgICAgICYmIGRpc2FibGVkLnJlZGRpdC5hY2NvdW50KSk7XG5cdFx0XHQkKCcjc291bmRjbG91ZC1jb250ZW50JykucHJvcCgnY2hlY2tlZCcsICEoZGlzYWJsZWQgJiYgZGlzYWJsZWQuc291bmRjbG91ZCAmJiBkaXNhYmxlZC5zb3VuZGNsb3VkLmNvbnRlbnQpKTtcblx0XHRcdCQoJyNzb3VuZGNsb3VkLWFjY291bnQnKS5wcm9wKCdjaGVja2VkJywgIShkaXNhYmxlZCAmJiBkaXNhYmxlZC5zb3VuZGNsb3VkICYmIGRpc2FibGVkLnNvdW5kY2xvdWQuYWNjb3VudCkpO1xuXHRcdFx0JCgnI3R3aXR0ZXItY29udGVudCcpLnByb3AoJ2NoZWNrZWQnLCAgICAhKGRpc2FibGVkICYmIGRpc2FibGVkLnR3aXR0ZXIgICAgJiYgZGlzYWJsZWQudHdpdHRlci5jb250ZW50KSk7XG5cdFx0XHQkKCcjdHdpdHRlci1hY2NvdW50JykucHJvcCgnY2hlY2tlZCcsICAgICEoZGlzYWJsZWQgJiYgZGlzYWJsZWQudHdpdHRlciAgICAmJiBkaXNhYmxlZC50d2l0dGVyLmFjY291bnQpKTtcblx0XHRcdCQoJyN5b3V0dWJlLWNvbnRlbnQnKS5wcm9wKCdjaGVja2VkJywgICAgIShkaXNhYmxlZCAmJiBkaXNhYmxlZC55b3V0dWJlICAgICYmIGRpc2FibGVkLnlvdXR1YmUuY29udGVudCkpO1xuXHRcdFx0JCgnI3lvdXR1YmUtYWNjb3VudCcpLnByb3AoJ2NoZWNrZWQnLCAgICAhKGRpc2FibGVkICYmIGRpc2FibGVkLnlvdXR1YmUgICAgJiYgZGlzYWJsZWQueW91dHViZS5hY2NvdW50KSk7XG5cdFx0fVxuXHRcdHNldF9kaXNhYmxlZChvYmouZGlzYWJsZWQpO1xuXG5cdFx0Y2hyb21lLnN0b3JhZ2Uub25DaGFuZ2VkLmFkZExpc3RlbmVyKGZ1bmN0aW9uKGNoYW5nZXMsIGFyZWFfbmFtZSkge1xuXHRcdFx0aWYgKGFyZWFfbmFtZSAhPT0gJ3N5bmMnIHx8ICEoJ2Rpc2FibGVkJyBpbiBjaGFuZ2VzKSkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRzZXRfZGlzYWJsZWQoY2hhbmdlcy5kaXNhYmxlZC5uZXdWYWx1ZSk7XG5cdFx0fSk7XG5cblx0XHQkKCdib2R5Jykub24oJ2NoYW5nZScsICdpbnB1dCcsIGZ1bmN0aW9uKCkge1xuXHRcdFx0JHNhdmVfYnV0dG9uXG5cdFx0XHRcdC5yZW1vdmVDbGFzcygnc2V0dGluZ3Mtc2F2ZWQnKVxuXHRcdFx0XHQucmVtb3ZlQ2xhc3MoJ3NldHRpbmdzLWVycm9yJylcblx0XHRcdFx0LnRleHQoJ1NhdmUgTXkgU2V0dGluZ3MnKTtcblx0XHR9KTtcblxuXHRcdCRzYXZlX2J1dHRvbi5vbignY2xpY2snLCBmdW5jdGlvbigpIHtcblx0XHRcdCRzYXZlX2J1dHRvblxuXHRcdFx0XHQucmVtb3ZlQ2xhc3MoJ3NldHRpbmdzLXNhdmVkJylcblx0XHRcdFx0LnJlbW92ZUNsYXNzKCdzZXR0aW5ncy1lcnJvcicpXG5cdFx0XHRcdC50ZXh0KCdTYXZpbmcuLi4nKTtcblx0XHRcdGNocm9tZS5zdG9yYWdlLnN5bmMuc2V0KHsgZGlzYWJsZWQgOiB7IGltZ3VyOiAgICAgIHsgY29udGVudDogISQoJyNpbWd1ci1jb250ZW50JykucHJvcCgnY2hlY2tlZCcpLCAgICAgIGFjY291bnQ6ICEkKCcjaW1ndXItYWNjb3VudCcpLnByb3AoJ2NoZWNrZWQnKSB9LFxuXHRcdFx0ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5zdGFncmFtOiAgeyBjb250ZW50OiAhJCgnI2luc3RhZ3JhbS1jb250ZW50JykucHJvcCgnY2hlY2tlZCcpLCAgYWNjb3VudDogISQoJyNpbnN0YWdyYW0tYWNjb3VudCcpLnByb3AoJ2NoZWNrZWQnKSB9LFxuXHRcdFx0ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVkZGl0OiAgICAgeyBjb250ZW50OiAhJCgnI3JlZGRpdC1jb250ZW50JykucHJvcCgnY2hlY2tlZCcpLCAgICAgYWNjb3VudDogISQoJyNyZWRkaXQtYWNjb3VudCcpLnByb3AoJ2NoZWNrZWQnKSB9LFxuXHRcdFx0ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc291bmRjbG91ZDogeyBjb250ZW50OiAhJCgnI3NvdW5kY2xvdWQtY29udGVudCcpLnByb3AoJ2NoZWNrZWQnKSwgYWNjb3VudDogISQoJyNzb3VuZGNsb3VkLWFjY291bnQnKS5wcm9wKCdjaGVja2VkJykgfSxcblx0XHRcdCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR3aXR0ZXI6ICAgIHsgY29udGVudDogISQoJyN0d2l0dGVyLWNvbnRlbnQnKS5wcm9wKCdjaGVja2VkJyksICAgIGFjY291bnQ6ICEkKCcjdHdpdHRlci1hY2NvdW50JykucHJvcCgnY2hlY2tlZCcpIH0sXG5cdFx0XHQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5b3V0dWJlOiAgICB7IGNvbnRlbnQ6ICEkKCcjeW91dHViZS1jb250ZW50JykucHJvcCgnY2hlY2tlZCcpLCAgICBhY2NvdW50OiAhJCgnI3lvdXR1YmUtYWNjb3VudCcpLnByb3AoJ2NoZWNrZWQnKSB9IH0gfSxcblx0XHRcdFx0ZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0aWYgKGNocm9tZS5ydW50aW1lLmxhc3RFcnJvcikge1xuXHRcdFx0XHRcdFx0cmV0dXJuICRzYXZlX2J1dHRvblxuXHRcdFx0XHRcdFx0XHQuYWRkQ2xhc3MoJ3NldHRpbmdzLWVycm9yJylcblx0XHRcdFx0XHRcdFx0LnRleHQoJ0Vycm9yOiAnICsgY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yLm1lc3NhZ2UpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHQkc2F2ZV9idXR0b25cblx0XHRcdFx0XHRcdC5hZGRDbGFzcygnc2V0dGluZ3Mtc2F2ZWQnKVxuXHRcdFx0XHRcdFx0LnRleHQoJ1NhdmVkIScpO1xuXHRcdFx0XHR9KTtcblx0XHR9KTtcblx0fSk7XG59KTtcbiJdfQ==
