var $ = require('jquery');

var client_side_calls = {
    reddit: require('YoCardsAPICalls/reddit')({ key: 'fNtoQI4_wDq21w' })
};

chrome.runtime.onMessage.addListener(function(request, sender, sendMessage) {
    if (client_side_calls[request.api]) {
        client_side_calls[request.api][request.type](request, function(err, result) {
            sendMessage([err, result]);
        });
        return true;
    }
    $.get('https://' + chrome.i18n.getMessage('app_short_name') + '.herokuapp.com/v1/' + request.api + '/' + request.type, request)
        .done(function(data) {
            sendMessage([null, data]);
        })
        .fail(function(err) {
            sendMessage([err]);
        });
    return true;
});
