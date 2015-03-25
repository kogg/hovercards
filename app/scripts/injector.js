'use strict';

define('injector', ['jquery'], function($) {
    var injector = { registered: {} };

    function register(context, injection) {
        if (!injection) {
            injection = context;
            context = 'default';
        }
        if (!injector.registered[context]) {
            injector.registered[context] = [];
        }
        injector.registered[context].push(injection);
    }
    injector.register = register;

    function inject(context, body) {
        if (!context && !body) {
            context = 'default';
            body = 'body';
        } else if (!body) {
            body = context;
            context = 'default';
        }
        if (!injector.registered[context]) {
            return;
        }
        body = $(body);
        for (var i = 0; i < injector.registered[context].length; i++) {
            injector.registered[context][i](body);
        }
    }
    injector.inject = inject;

    return injector;
});
