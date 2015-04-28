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
