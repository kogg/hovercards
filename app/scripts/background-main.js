var _     = require('underscore');
var async = require('async');

async.series([
    function(callback) {
        chrome.storage.local.get('device_id', function(obj) {
            if (chrome.runtime.lastError) {
                return callback(chrome.runtime.lastError);
            }
            if (obj.device_id) {
                return callback();
            }
            obj = { device_id: _.times(25, _.partial(_.sample, 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', 1, 1)).join('') };
            chrome.storage.local.set(obj, function() {
                callback(chrome.runtime.lastError);
            });
        });
    },
    function(callback) {
        require('./service-background')();
        callback();
    }
]);

chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.executeScript(tab.id, { code: 'window.top.postMessage({ msg: \'activate\', url: \'' + tab.url + '\' }, \'*\');' });
});
