const crypto = require('crypto');

process.env.JWT_SECRET = crypto.randomBytes(32).toString('hex');
