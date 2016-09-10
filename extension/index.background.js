require('../report');
var createStore = require('../redux/createStore.background');

require('./browser-action');
require('./content-security-policy');
require('./set-uninstall-url');

createStore();
