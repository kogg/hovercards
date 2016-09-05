require('../report');
var createStore = require('../redux/createStore.background');

require('./content-security-policy');
require('./set-uninstall-url');

createStore();
