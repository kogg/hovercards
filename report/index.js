var raven = require('raven');

module.exports = new raven.Client(process.env.SENTRY_DSN, {
	environment: process.env.NODE_ENV,
	release:     process.env.npm_package_version
});

module.exports.patchGlobal();
