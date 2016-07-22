var req = require.context('./', true, /background\.js$/);
req.keys().forEach(req);
