'use strict';

module.exports =  function stateManager() {
    var state = {};
    chrome.runtime.onMessage.addListener(function(request, sender, callback) {
        switch (request.msg) {
            case 'get':
                callback(state[request.value]);
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
};
