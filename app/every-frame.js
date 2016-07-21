var req = require.context('./', true, /every-frame\.js$/);
req.keys().forEach(req);
