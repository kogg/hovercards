var req = require.context('./', true, /top-frame\.js$/);
req.keys().forEach(req);
