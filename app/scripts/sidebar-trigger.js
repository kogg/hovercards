module.exports = function sidebarTrigger() {
    return function(tabId, request, sendMessage) {
        if (!request) {
            return;
        }
        sendMessage = sendMessage || function() {};
        switch (request.msg) {
            case 'ready':
                chrome.tabs.sendMessage(tabId, { msg: 'set', value: { ready: true } });
                chrome.tabs.sendMessage(tabId, { msg: 'get', value: 'sent' }, function(url) {
                    if (!url) {
                        return;
                    }
                    sendMessage(tabId, { msg: 'load', url: url });
                });
                break;
            case 'activate':
                chrome.tabs.sendMessage(tabId, { msg: 'get', value: 'sent' }, function(url) {
                    var msg;
                    if (request.url !== url) {
                        msg = { msg: 'load', url: request.url };
                        chrome.tabs.sendMessage(tabId, { msg: 'set', value: { sent: request.url } });
                    } else {
                        msg = { msg: 'hide' };
                        chrome.tabs.sendMessage(tabId, { msg: 'set', value: { sent: null } });
                    }
                    chrome.tabs.sendMessage(tabId, { msg: 'get', value: 'ready' }, function(ready) {
                        if (!ready) {
                            return;
                        }
                        sendMessage(tabId, msg);
                    });
                });
                break;
            case 'hide':
                chrome.tabs.sendMessage(tabId, { msg: 'set', value: { sent: null } });
                chrome.tabs.sendMessage(tabId, { msg: 'get', value: 'ready' }, function(ready) {
                    if (!ready) {
                        return;
                    }
                    sendMessage(tabId, { msg: 'hide' });
                });
                break;
        }
    };
};
