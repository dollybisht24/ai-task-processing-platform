const rateLimit = require('express-rate-limit');
const { errorResponse } = require('../utils/apiResponse');

// General API rate limiter (generous to accommodate real-time dashboard & task polling)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10000,
  standardHeaders: true,
  legacyHeaders: false,
  validate: {
    xForwardedForHeader: false,
    default: true
  },
  handler: (req, res) => {
    return errorResponse(res, 'Too many requests from this IP, please try again after 15 minutes', 429);
  }
});

// Auth rate limiter for sensitive authentication endpoints (register, login)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  validate: {
    xForwardedForHeader: false,
    default: true
  },
  handler: (req, res) => {
    return errorResponse(res, 'Too many authentication attempts, please try again after 15 minutes', 429);
  }
});

module.exports = {
  apiLimiter,
  authLimiter
};
