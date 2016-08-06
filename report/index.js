var rollbar = require('rollbar');

rollbar.init(process.env.ROLLBAR_ACCESS_TOKEN || ' ', {
	codeVersion: process.env.npm_package_gitHead,
	environment: process.env.NODE_ENV
});
rollbar.handleUncaughtExceptionsAndRejections();

module.exports = rollbar;
