const bodyParser = require('body-parser');

// Increase the limit for JSON payloads
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
