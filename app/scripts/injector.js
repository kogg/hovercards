'use strict';

define('injector', [], function() {
    var injector = { registered: {} };

    function register(context, body, injection) {
        if (!injector.registered[context]) {
            injector.registered[context] = {};
        }
        if (!injector.registered[context][body]) {
            injector.registered[context][body] = [];
        }
        injector.registered[context][body].push(injection);
    }
    injector.register = register;

    function inject() {
    }
    injector.inject = inject;

    return injector;
});
