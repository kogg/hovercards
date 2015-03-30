'use strict';

define('state-manager', [], function() {
    return {
        init: function stateManager() {
            var state = {};
            chrome.runtime.onMessage.addListener(function(request, sender, callback) {
                switch (request.msg) {
                    case 'getstate':
                        callback(state);
                        return true;
                    case 'setstate':
                        state = request.state;
                        callback();
                        return true;
                }
            });
        }
    };
});
