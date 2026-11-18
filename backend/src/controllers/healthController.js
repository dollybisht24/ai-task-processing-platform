const { getConnectionStatus } = require('../config/db');
const { isRedisConnected } = require('../config/redis');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const getHealth = (req, res) => {
  return successResponse(res, {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  }, 'Service is live');
};

const getReady = (req, res) => {
  const mongoOk = getConnectionStatus();
  const redisOk = isRedisConnected();

  const details = {
    mongodb: mongoOk ? 'connected' : 'disconnected',
    redis: redisOk ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  };

  if (mongoOk && redisOk) {
    return successResponse(res, details, 'Service is ready to handle traffic');
  }

  return errorResponse(res, 'Service not ready: one or more dependencies are down', 503, details);
};

module.exports = {
  getHealth,
  getReady
};
