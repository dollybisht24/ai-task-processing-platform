const rateLimit = require('express-rate-limit');
const { errorResponse } = require('../utils/apiResponse');

// General API rate limiter: 1000 requests per 15 minutes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return errorResponse(res, 'Too many requests from this IP, please try again after 15 minutes', 429);
  }
});

// Auth rate limiter: 200 requests per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return errorResponse(res, 'Too many authentication attempts, please try again after 15 minutes', 429);
  }
});

module.exports = {
  apiLimiter,
  authLimiter
};
