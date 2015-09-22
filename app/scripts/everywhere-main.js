// New Stuff
require('./analytics/any-frame')();
require('./hovercard/any-frame')('a[href]:not(.no-yo,.hoverZoomLink,[data-href],[data-expanded-url])', function(link) { return link.attr('href'); });
require('./hovercard/any-frame')('a[data-href]:not(.no-yo,.hoverZoomLink,[data-expanded-url])',        function(link) { return link.data('href'); });
require('./hovercard/any-frame')('a[data-expanded-url]:not(.no-yo,.hoverZoomLink,[data-href])',        function(link) { return link.data('expanded-url'); });
// FIXME Twitter follow button hack
require('./hovercard/any-frame')('iframe.twitter-follow-button:not(.no-yo)', function(iframe) {
    var match = iframe.attr('src').match(/[?&]screen_name=([a-zA-Z0-9_]+)(?:&|$)/);
    if (!match || !match[1]) {
        return;
    }
    return 'https://twitter.com/' + match[1];
});

/*
var $ = require('jquery');

var hovercard = require('./hovercard');

var EXTENSION_ID = chrome.i18n.getMessage('@@extension_id');

$(document).on('keydown', function(e) {
    if (e.which !== 27) {
        return;
    }
    window.top.postMessage({ msg: EXTENSION_ID + '-Esc' }, '*');
});

if (document.URL.match(/[&?]noyo=1/)) {
    return;
}

chrome.storage.sync.get('disabled', function(obj) {
    var disabled = obj.disabled || { };

    chrome.storage.onChanged.addListener(function(changes, area_name) {
        if (area_name !== 'sync' || !('disabled' in changes)) {
            return;
        }
        disabled = changes.disabled.newValue;
    });

    function accept_identity(identity, obj) {
        if (disabled[identity.api] && disabled[identity.api][identity.type]) {
            return false;
        }
        return identity.api !== document.domain.replace(/\.com$/, '').replace(/^.*\./, '') ||
               (identity.api === 'imgur' && identity.type === 'account' && !obj.is('.account-user-name') && !obj.parents('.options,.user-dropdown').length) ||
               (identity.api === 'instagram' && identity.type === 'account' && !obj.is('.-cx-PRIVATE-Navigation__menuLink') && !obj.parents('.dropdown').length) ||
               (identity.api === 'reddit' && (identity.type === 'account' ? !$('body.res').length && !obj.parents('.tabmenu,.user').length :
                                                                            obj.parents('.usertext-body,.search-result-body').length)) ||
               (identity.api === 'twitter' && identity.type === 'account' && document.domain === 'tweetdeck.twitter.com') ||
               (identity.api === 'youtube' && document.URL.indexOf('youtube.com/embed') !== -1);
    }

    hovercard('a[href]:not(.no-yo,.hoverZoomLink,[data-href],[data-expanded-url])', function(link) { return link.attr('href'); },         accept_identity);
    hovercard('a[data-href]:not(.no-yo,.hoverZoomLink,[data-expanded-url])',        function(link) { return link.data('href'); },         accept_identity);
    hovercard('a[data-expanded-url]:not(.no-yo,.hoverZoomLink,[data-href])',        function(link) { return link.data('expanded-url'); }, accept_identity);

    // FIXME Twitter follow button hack
    hovercard('iframe.twitter-follow-button:not(.no-yo)', function(iframe) {
        var match = iframe.attr('src').match(/[?&]screen_name=([a-zA-Z0-9_]+)(?:&|$)/);
        if (!match || !match[1]) {
            return;
        }
        return 'https://twitter.com/' + match[1];
    }, accept_identity);
});

$('html').on('hovercardclick.' + EXTENSION_ID, function(e, url) {
    window.top.postMessage({ msg: EXTENSION_ID + '-activate', by: 'hovercard', url: url }, '*');
});
*/
