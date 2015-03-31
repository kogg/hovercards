'use strict';

define('state-manager', [], function() {
    return {
        init: function stateManager() {
            var state = {};
            chrome.runtime.onMessage.addListener(function(request, sender, callback) {
                switch (request.msg) {
                    case 'get':
                        callback(state[request.value] || null);
                        return true;
                    case 'set':
                        for (var key in request.value) {
                            state[key] = request.value[key];
                            break;
                        }
                        callback();
                        return true;
                }
            });
        }
    };
});
