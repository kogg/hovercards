var redis = require('redis');

var report = require('../report');

module.exports = redis.createClient({ url: process.env.REDISCLOUD_URL });

module.exports.on('error', report.captureException);
