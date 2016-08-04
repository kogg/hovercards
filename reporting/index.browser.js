var rollbar = require('rollbar-browser');

module.exports = rollbar.init({
	payload: {
		client: {
			javascript: {
				code_version:          process.env.npm_package_gitHead,
				source_map_enabled:    true,
				guess_uncaught_frames: true
			}
		},
		environment: process.env.NODE_ENV
	},
	accessToken:                process.env.ROLLBAR_CLIENT_ACCESS_TOKEN,
	enabled:                    Boolean(process.env.ROLLBAR_CLIENT_ACCESS_TOKEN),
	verbose:                    !process.env.NODE_ENV,
	captureUncaught:            true,
	captureUnhandledRejections: true
});
