var $ = require('jquery');

chrome.storage.local.get('user_id', function(obj) {
    if (!obj.user_id) {
        obj.user_id = (Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2)).substr(0, 25);
        chrome.storage.local.set(obj);
    }

    var client_side_calls = {
        reddit: require('YoCardsAPICalls/reddit')({ key: 'fNtoQI4_wDq21w', user: obj.user_id })
    };

    chrome.runtime.onMessage.addListener(function(request, sender, sendMessage) {
        request = $.extend({}, request);
        var api  = request.api;
        var type = request.type;
        delete request.api;
        delete request.type;

        if (client_side_calls[api] && client_side_calls[api][type]) {
            client_side_calls[api][type](request, function(err, result) {
                sendMessage([err, result]);
            });
        } else {
            $.ajax({ url:     'https://' + chrome.i18n.getMessage('app_short_name') + '.herokuapp.com/v1/' + api + '/' + type,
                     data:    request,
                     headers: { user: obj.user_id} })
                .done(function(data) {
                    sendMessage([null, data]);
                })
                .fail(function(err) {
                    sendMessage([err]);
                });
        }
        return true;
    });
});

chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.executeScript(tab.id, { code: 'window.top.postMessage({ msg: \'activate\', url: \'' + tab.url + '\' }, \'*\');' });
});
