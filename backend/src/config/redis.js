const Redis = require('ioredis');
const env = require('./env');
const logger = require('../utils/logger');

let redisClient = null;
let isConnected = false;

const getRedisClient = () => {
  if (redisClient) {
    return redisClient;
  }

  const options = {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    retryStrategy(times) {
      const delay = Math.min(times * 200, 3000);
      logger.warn(`Redis reconnecting attempt ${times} after ${delay}ms...`);
      return delay;
    },
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    autoResubscribe: true
  };

  if (env.REDIS_PASSWORD) {
    options.password = env.REDIS_PASSWORD;
  }

  redisClient = new Redis(options);

  redisClient.on('connect', () => {
    logger.info(`Connecting to Redis at ${env.REDIS_HOST}:${env.REDIS_PORT}...`);
  });

  redisClient.on('ready', () => {
    isConnected = true;
    logger.info('Redis client ready');
  });

  redisClient.on('error', (err) => {
    isConnected = false;
    logger.error('Redis error:', err.message);
  });

  redisClient.on('close', () => {
    isConnected = false;
    logger.warn('Redis connection closed');
  });

  return redisClient;
};

const disconnectRedis = async () => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    isConnected = false;
    logger.info('Redis disconnected cleanly');
  }
};

module.exports = {
  getRedisClient,
  disconnectRedis,
  isRedisConnected: () => isConnected
};
