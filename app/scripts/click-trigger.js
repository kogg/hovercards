var $ = require('jquery');

module.exports = function(body, selector, get_url) {
    body = $(body);
    body.on('click', selector, function() {
        var url = get_url($(this));
        if (!url) {
            return;
        }
        chrome.runtime.sendMessage({ msg: 'activate', url: url });
    });
};
