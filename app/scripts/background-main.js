var trigger_background = require('./trigger-background')();
chrome.runtime.onMessage.addListener(function(request, sender) {
    var tabId = sender.tab.id;
    trigger_background(tabId, request);
});
require('./notifications-background')();
