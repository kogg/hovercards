var $     = require('jquery');
var async = require('async');

var endpoint = 'https://' + chrome.i18n.getMessage('app_short_name') + '.herokuapp.com/v1';
// var endpoint = 'http://localhost:5000/v1';

function get_user(api, callback) {
    chrome.storage.sync.get(api + '-user', function(obj) {
        if (!obj || !obj[api + '-user']) {
            return chrome.identity.getProfileUserInfo(function(user) {
                if (chrome.runtime.lastError) {
                    return callback(chrome.runtime.lastError);
                }
                callback(null, user.id);
            });
        }
        callback(null, obj[api + '-user']);
    });
}

async.parallel({
    reddit: function(callback) {
        get_user('reddit', function(err, user) {
            if (err) {
                return callback(err);
            }
            callback(null, require('YoCardsAPICalls/reddit')({ key: 'fNtoQI4_wDq21w', user: user }));
        });
    }
}, function(err, client_side_calls) {
    if (err) {
        return console.error(err);
    }
    chrome.runtime.onMessage.addListener(function(request, sender, _sendMessage) {
        var callback = function(err, val) {
            _sendMessage([err, val]);
        };
        request = $.extend({}, request);
        var api  = request.api;
        var type = request.type;
        delete request.api;
        delete request.type;

        if (client_side_calls[api] && client_side_calls[api][type]) {
            client_side_calls[api][type](request, function(err, result) {
                err = err || (!result && { status: 404 });
                if (err) {
                    return callback(err);
                }
                callback(err, result);
            });
        } else if (type === 'auth') {
            chrome.identity.launchWebAuthFlow({ url: endpoint + '/' + api + '/authenticate', interactive: true },
                function(redirect_url) {
                    if (chrome.runtime.lastError) {
                        return callback(chrome.runtime.lastError);
                    }
                    var obj = {};
                    obj[api + '-user'] = redirect_url; // FIXME Parse the URL for the token
                    chrome.storage.sync.set(obj, function() {
                        if (chrome.runtime.lastError) {
                            return callback(chrome.runtime.lastError);
                        }
                        callback();
                    });
                });
        } else {
            get_user(api, function(err, user) {
                if (err) {
                    return callback(err);
                }
                $.ajax({ url:     endpoint + '/' + api + '/' + type,
                         data:    request,
                         headers: { user: user } })
                    .done(function(data) {
                        callback(null, data);
                    })
                    .fail(function(err) {
                        callback(err);
                    });
            });
        }
        return true;
    });
});

chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.executeScript(tab.id, { code: 'window.top.postMessage({ msg: \'activate\', url: \'' + tab.url + '\' }, \'*\');' });
});
