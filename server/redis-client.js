var _     = require('underscore');
var redis = require('redis');

module.exports = redis.createClient({ url: process.env.REDISCLOUD_URL });

module.exports.on('error', _.noop);
