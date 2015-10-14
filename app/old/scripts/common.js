exports.is_active = function(obj) {
    return obj.is(':active');
};

exports.massage_url = function(url) {
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
};

var width = 'idk';
exports.get_scrollbar_width = function() {
    if (width === 'idk') {
        var scrollDiv = document.createElement('div');
        scrollDiv.style.width = '100px';
        scrollDiv.style.height = '100px';
        scrollDiv.style.overflow = 'scroll';
        scrollDiv.style.position = 'absolute';
        scrollDiv.style.top = '-9999px';
        document.body.appendChild(scrollDiv);
        width = scrollDiv.offsetWidth - scrollDiv.clientWidth;
        document.body.removeChild(scrollDiv);
    }
    return width;
};
