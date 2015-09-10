var $       = require('jquery');
var _       = require('underscore');
var URI     = require('URIjs/src/URI');
var async   = require('async');
var memoize = require('memoizee');

// FIXME SUPER SHIM
(function() {
    require('http').request = _.wrap(require('http').request, function(request, params, cb) {
        if (!params.protocol && params.scheme) {
            params.protocol = params.scheme + ':';
        }
        return request(params, cb);
    });
}());

var ENDPOINT = 'https://hovercards.herokuapp.com/v1';
// var ENDPOINT = 'http://localhost:5000/v1';
var INSTAGRAM_KEY = '41e56061c1e34fbbb16ab1d095dad78b';
var REDDIT_KEY = '0jXqEudQPqSL6w';
var SOUNDCLOUD_KEY = '78a827254bd7a5e3bba61aa18922bf2e';

var client_side_authenticators = {
    instagram: function(callback) {
        chrome.identity.launchWebAuthFlow({ url:         'https://instagram.com/oauth/authorize/?client_id=' + INSTAGRAM_KEY +
                                                         '&redirect_uri=https://' + chrome.i18n.getMessage('@@extension_id') + '.chromiumapp.org/callback' +
                                                         '&response_type=token',
                                            interactive: true },
            function(redirect_url) {
                if (chrome.runtime.lastError) {
                    return callback(_.extend({ status: 401 }, chrome.runtime.lastError));
                }
                callback(null, URI(redirect_url).hash().split('=')[1]);
            });
    }
};

var initialize_client_callers = {
    instagram: function(callback) {
        chrome.storage.sync.get('instagram_user', function(obj) {
            if (chrome.runtime.lastError) {
                return callback(chrome.runtime.lastError);
            }
            if (!obj.instagram_user) {
                return callback();
            }
            return callback(null, require('YoCardsAPICalls/instagram')({ user: obj.instagram_user }));
        });
    },
    reddit: function(callback) {
        async.waterfall([
            function(callback) {
                chrome.storage.local.get('device_id', function(obj) {
                    if (chrome.runtime.lastError) {
                        return callback(chrome.runtime.lastError);
                    }
                    if (!obj.device_id) {
                        obj = { device_id: _.times(25, _.partial(_.sample, 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', 1, 1)).join('') };
                        chrome.storage.local.set(obj);
                    }
                    callback(null, obj.device_id);
                });
            },
            function(device_id, callback) {
                callback(null, require('YoCardsAPICalls/reddit')({ key: REDDIT_KEY, device: device_id }));
            }
        ], callback);
    },
    soundcloud: function(callback) {
        callback(null, require('YoCardsAPICalls/soundcloud')({ key: SOUNDCLOUD_KEY }));
    }
};

initialize_client_callers = _.mapObject(initialize_client_callers, function(initializer) {
    return function(callback) {
        return initializer(function(err, client_caller) {
            if (err) {
                return callback(err);
            }
            _.chain(client_caller)
             .functions()
             .filter(function(method) {
                 return method.indexOf('__') === 0;
             })
             .each(function(method) {
                 var cache_options = client_caller[method].cache_options || {};
                 client_caller[method] = memoize(_.wrap(client_caller[method], function(func, args_to_cache, args_not_to_cache, callback) {
                     args_to_cache = JSON.parse(args_to_cache);
                     func(args_to_cache, args_not_to_cache, callback);
                 }), { async: true, length: 1, maxAge: cache_options.ttl || 5 * 60 * 1000, primitive: true, resolvers: [JSON.stringify] });
             });
            callback(null, client_caller);
        });
    };
});

module.exports = function() {
    async.parallel(initialize_client_callers, function(err, client_callers) {
        if (err) {
            return console.error(err);
        }
        var server_callers = {};
        chrome.runtime.onMessage.addListener(function(message, sender, callback) {
            if (message.type !== 'service') {
                return;
            }
            var request = message.request;
            var api  = request.api;
            var type = request.type;
            callback = _.wrap(callback, function(callback, err, result) {
                if (err) {
                    console.warn(api, type, request, 'Error', err);
                } else {
                    console.info(api, type, request, 'Result', result);
                }
                callback([err, result]);
            });

            if (type === 'auth') {
                async.waterfall([
                    client_side_authenticators[api] || function(callback) {
                        chrome.identity.launchWebAuthFlow({ url:         ENDPOINT + '/' + api + '/authenticate?chromium_id=' + chrome.i18n.getMessage('@@extension_id'),
                                                            interactive: true }, function(redirect_url) {
                            if (chrome.runtime.lastError) {
                                return callback(_.extend({ status: 401 }, chrome.runtime.lastError));
                            }
                            callback(null, URI(redirect_url).hash().split('=')[1]);
                        });
                    },
                    function(user, callback) {
                        var obj = {};
                        obj[api + '_user'] = user;
                        chrome.storage.sync.set(obj, function() {
                            callback(chrome.runtime.lastError);
                        });
                    },
                    function(callback) {
                        if (!client_side_authenticators[api] || !initialize_client_callers[api]) {
                            return callback();
                        }
                        initialize_client_callers[api](function(err, client_caller) {
                            if (err) {
                                return callback(err);
                            }
                            client_callers[api] = client_caller;
                            callback();
                        });
                    }
                ], callback);
            } else {
                async.parallel({
                    device_id: function(callback) {
                        chrome.storage.local.get('device_id', function(obj) {
                            if (chrome.runtime.lastError) {
                                return callback(chrome.runtime.lastError);
                            }
                            if (!obj.device_id) {
                                obj = { device_id: _.times(25, _.partial(_.sample, 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', 1, 1)).join('') };
                                chrome.storage.local.set(obj);
                            }
                            callback(null, obj.device_id);
                        });
                    },
                    user: function(callback) {
                        chrome.storage.sync.get(api + '_user', function(obj) {
                            callback(chrome.runtime.lastError, obj[api + '_user']);
                        });
                    }
                }, function(err, headers) {
                    if (err) {
                        return callback(err);
                    }
                    callback = _.wrap(callback, function(callback, err, result) {
                        if (_.isObject(err) && err.status === 401) {
                            return chrome.storage.sync.remove(api + '_user', function() {
                                callback(chrome.runtime.lastError || err);
                            });
                        }
                        callback(err, result);
                    });
                    request = _.omit(request, 'api', 'type');
                    if (client_callers[api] && client_callers[api][type]) {
                        client_callers[api][type](_.extend(headers, request), callback);
                    } else {
                        server_callers[api] = server_callers[api] || {};
                        server_callers[api][type] = server_callers[api][type] || memoize(function(request, headers, callback) {
                            request = JSON.parse(request);
                            headers = JSON.parse(headers);
                            $.ajax({ url:     ENDPOINT + '/' + api + '/' + type,
                                     data:    request,
                                     headers: headers })
                                .done(function(data) {
                                    callback(null, data);
                                })
                                .fail(function(err) {
                                    callback(err);
                                });
                        }, { async: true, length: 2, maxAge: 5 * 60 * 1000, primitive: true, resolvers: [JSON.stringify, JSON.stringify] });
                        server_callers[api][type](request, headers, callback);
                    }
                });
            }

            return true;
        });
    });
    chrome.storage.sync.get(['feedback_url', 'last_interacted_feedback_url', 'last_feedback_retrieval'], function(obj) {
        (function retrieve_feedback_url() {
            setTimeout(function() {
                obj.feedback_url = 'test';
                chrome.storage.sync.set({ feedback_url: obj.feedback_url });
                obj.last_feedback_retrieval = Date.now();
                chrome.storage.sync.set({ last_feedback_retrieval: obj.last_feedback_retrieval });
                retrieve_feedback_url();
                /*
                $.ajax({ url: ENDPOINT + '/feedback_url' })
                    .done(function(data) {
                        obj.feedback_url = data.url;
                        chrome.storage.sync.set({ feedback_url: obj.feedback_url });
                    })
                    .always(function() {
                        obj.last_feedback_retrieval = Date.now();
                        chrome.storage.sync.set({ last_feedback_retrieval: obj.last_feedback_retrieval });
                        retrieve_feedback_url();
                    });
                */
            }, Math.max(0, (obj.last_feedback_retrieval || 0) + 24 * 60 * 60 * 1000 - Date.now()));
        }());
    });
};
