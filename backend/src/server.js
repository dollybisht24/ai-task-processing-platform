const app = require('./app');
const env = require('./config/env');
const logger = require('./utils/logger');
const { connectDB, disconnectDB } = require('./config/db');
const { getRedisClient, disconnectRedis } = require('./config/redis');
const queueService = require('./services/queueService');

let server;

const startServer = async () => {
  try {
    // 1. Connect to MongoDB
    await connectDB();

    // 2. Connect to Redis & initialize streams
    getRedisClient();
    await queueService.initQueue();

    // 3. Start listening
    server = app.listen(env.PORT, () => {
      logger.info(`Backend API server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

// Graceful shutdown handling
const gracefulShutdown = async (signal) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed');
      try {
        await disconnectRedis();
        await disconnectDB();
        logger.info('All connections closed cleanly. Exiting.');
        process.exit(0);
      } catch (err) {
        logger.error(`Error during shutdown cleanup: ${err.message}`);
        process.exit(1);
      }
    });

    // Force exit if cleanup takes longer than 10 seconds
    setTimeout(() => {
      logger.error('Forced shutdown after 10s timeout.');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception thrown:', error);
  process.exit(1);
});

startServer();
