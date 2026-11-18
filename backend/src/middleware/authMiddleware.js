const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');
const { errorResponse } = require('../utils/apiResponse');

const authenticate = async (req, res, next) => {
  try {
    let token = null;

    // Check authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      // Check HttpOnly cookie
      token = req.cookies.token;
    }

    if (!token) {
      return errorResponse(res, 'Authentication required. No token provided.', 401);
    }

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET);
      const user = await User.findById(decoded.userId);

      if (!user) {
        return errorResponse(res, 'User no longer exists. Please log in again.', 401);
      }

      req.user = user;
      next();
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return errorResponse(res, 'Token has expired. Please log in again.', 401);
      }
      return errorResponse(res, 'Invalid token. Authorization denied.', 401);
    }
  } catch (error) {
    next(error);
  }
};

module.exports = authenticate;
