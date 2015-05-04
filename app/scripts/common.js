var URI = require('URIjs/src/URI');

exports.identify_url = function(url) {
    url = (url || '').replace(/\/$/, '');
    var uri = URI(url);

    switch (uri.domain().replace(/^www\./, '')) {
        case 'youtube.com':
            switch (uri.directory()) {
                case '/':
                    if (uri.filename() === 'watch') {
                        var query = uri.search(true);
                        if (query.v) {
                            return { api: 'youtube', type: 'content', id: query.v };
                        }
                    }
                    break;
                case '/v':
                case '/embed':
                    return { api: 'youtube', type: 'content', id: uri.filename() };
                case '/channel':
                    return { api: 'youtube', type: 'account', id: uri.filename() };
            }
            break;
        case 'youtu.be':
            return { api: 'youtube', type: 'content', id: uri.filename() };
        case 'reddit.com':
            if (uri.directory() === '/user') {
                return { api: 'reddit', type: 'account', id: uri.filename() };
            } else {
                var match = uri.directory().match(/^\/r\/[^/]+\/comments(\/([^/]+))?/);
                if (match) {
                    return { api: 'reddit', type: 'discussion', id: match[2] || uri.filename() };
                }
            }
            break;
    }
};

exports.is_active = function(obj) {
    return obj.is(':active');
};

exports.is_fullscreen = function(element) {
    var dom = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement;
    return dom && element.is(dom);
};

exports.nullify_bad_url = function(url) {
    if (url.match(/^javascript:.*/)) {
        return null;
    }
    return url;
};

exports.relative_to_absolute = function(url) {
    var a = document.createElement('a');
    a.href = url;
    url = a.href;
    a.href = '';
    if (a.remove) {
        a.remove();
    }
    return url;
};
