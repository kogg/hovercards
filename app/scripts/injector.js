'use strict';

define('injector', ['jquery'], function($) {
    var injector = { registered: {} };

    function register(context, injection) {
        if (!injection) {
            return injector.register('default', context);
        }
        if (!injector.registered[context]) {
            injector.registered[context] = [];
        }
        injector.registered[context].push(injection);
    }
    injector.register = register;

    function inject(context, body) {
        if (!context && !body) {
            return injector.inject('default', 'body');
        } else if (!body) {
            return injector.inject('default', context);
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
