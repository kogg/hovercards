module.exports = function sidebarTrigger(sendMessage) {
    var ready;
    var url;

    return function(request) {
        if (!request) {
            return;
        }
        sendMessage = sendMessage || function() {};
        switch (request.msg) {
            case 'ready':
                ready = true;
                if (!url) {
                    return;
                }
                sendMessage({ msg: 'load', url: url });
                break;
            case 'activate':
                var msg;
                if (request.url !== url) {
                    msg = { msg: 'load', url: request.url };
                    url = request.url;
                } else {
                    msg = { msg: 'hide' };
                    url = null;
                }
                if (!ready) {
                    return;
                }
                sendMessage(msg);
                break;
            case 'hide':
                url = null;
                if (!ready) {
                    return;
                }
                sendMessage({ msg: 'hide' });
                break;
        }
    };
};
