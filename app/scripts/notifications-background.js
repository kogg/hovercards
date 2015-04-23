module.exports = function notificationsBackgroundInit() {
    chrome.storage.sync.clear();
    var intro_levels = [{ msg: 'hovered', type: 'firsthover' },
                        { msg: 'loaded',  type: 'firstload' },
                        { msg: 'hidden',  type: 'firsthide' }];
    chrome.runtime.onMessage.addListener(function(request, sender) {
        chrome.storage.sync.get('intro', function(storage) {
            if (storage.intro) {
                return;
            }
            var tabId = sender.tab.id;
            chrome.tabs.sendMessage(tabId, { msg: 'get', value: 'introlevel' }, function(introlevel) {
                introlevel = introlevel || 0;
                if (request.msg !== intro_levels[introlevel].msg) {
                    return;
                }
                chrome.tabs.sendMessage(tabId, { msg: 'notify', type: intro_levels[introlevel].type });
                chrome.tabs.sendMessage(tabId, { msg: 'set', value: { introlevel: ++introlevel } });
                if (intro_levels.length !== introlevel) {
                    return;
                }
                chrome.storage.sync.set({ intro: true });
            });
        });
    });
};
