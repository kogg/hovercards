'use strict';

define('injector', [], function() {
    var injector = { registered: {} };

    function register(context, injection) {
        if (!injector.registered[context]) {
            injector.registered[context] = [];
        }
        injector.registered[context].push(injection);
    }
    injector.register = register;

    function inject() {
    }
    injector.inject = inject;

    return injector;
});
