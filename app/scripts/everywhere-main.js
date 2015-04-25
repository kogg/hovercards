var trigger_inject = require('./trigger-inject');

trigger_inject.on('html', function sendMessage(msg) {
    window.top.postMessage(msg, '*');
});
