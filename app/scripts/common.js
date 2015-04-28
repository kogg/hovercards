var URI = require('URIjs/src/URI');

exports.identify_url = function(url) {
    var uri = URI(url);

    switch (uri.domain()) {
        case 'youtube.com':
            switch (uri.directory()) {
                case '/':
                    if (uri.filename() === 'watch') {
                        var query = uri.search(true);
                        if (query.v) {
                            return { type: 'content', thing: { type: 'youtube-video', id: query.v } };
                        }
                    }
                    break;
                case '/v':
                case '/embed':
                    return { type: 'content', thing: { type: 'youtube-video', id: uri.filename() } };
                case '/channel':
                    return { type: 'account', thing: [{ type: 'youtube-channel', id: uri.filename() }] };
            }
            break;
        case 'youtu.be':
            return { type: 'content', thing: { type: 'youtube-video', id: uri.filename() } };
        case 'reddit.com':
            if (uri.directory() === '/user') {
                return { type: 'account', thing: [{ type: 'reddit-user', id: uri.filename() }] };
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
