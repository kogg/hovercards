var $     = require('jquery');
var async = require('async');

var user_id;
async.detectSeries([chrome.identity.getProfileUserInfo, chrome.storage.local.get],
    function(fn, callback) {
        fn(function(obj) {
            if (chrome.runtime.lastError) {
                console.error('error', chrome.runtime.lastError);
                return callback(false);
            }
            user_id = obj.id;
            callback(!!user_id);
        });
    },
    function(got_one) {
        if (!got_one) {
            console.log('couldn\'t get an id');
        }
        console.log(user_id);
        var client_side_calls = {
            reddit: require('YoCardsAPICalls/reddit')({ key: 'fNtoQI4_wDq21w', user: user_id })
        };

        chrome.runtime.onMessage.addListener(function(request, sender, sendMessage) {
            request = $.extend({}, request);
            var api  = request.api;
            var type = request.type;
            delete request.api;
            delete request.type;

            if (client_side_calls[api] && client_side_calls[api][type]) {
                client_side_calls[api][type](request, function(err, result) {
                    err = err || (!result && { status: 404 });
                    if (err) {
                        return sendMessage([err]);
                    }
                    sendMessage([err, result]);
                });
            } else {
                $.ajax({ url:     'https://' + chrome.i18n.getMessage('app_short_name') + '.herokuapp.com/v1/' + api + '/' + type,
                         data:    request,
                         headers: { user: user_id } })
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
