'use strict';

define('youtube', [], function() {
    function inject(body, context) {
        if (!body) {
            body = 'body';
        }
        switch (context) {
            case 'youtube-iframe':
                console.log('youtube-iframe');
                break;
            default:
                console.log('default', context);
                break;
        }
    }

    return { inject: inject };
});
