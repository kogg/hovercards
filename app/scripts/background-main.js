var sidebar_trigger = require('./sidebar-trigger')();
chrome.runtime.onMessage.addListener(function(request, sender) {
    var tabId = sender.tab.id;
    sidebar_trigger(tabId, request);
});
require('./notifications-background')();
