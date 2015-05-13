/* exported chrome */

var chrome = global.chrome = (function() {
    var noop = function() {};
    return { extension:  { getURL: function(filename) { return 'chrome-extension://extension_id/' + filename; } },
                           i18n:       { getMessage: function(message) {
                               if (message === '@@extension_id') {
                                   return 'extension-id';
                               }
                               return '__MSG_' + message + '__';
                           } },
                           pageAction: { setIcon: noop,
                                         show:    noop },
                           runtime:    { onMessage:   { addListener: noop },
                                         sendMessage: noop },
                           storage:    { sync:        { clear: noop,
                                                        get:   noop,
                                                        set:   noop } },
                           tabs:       { sendMessage: noop } };
}());
