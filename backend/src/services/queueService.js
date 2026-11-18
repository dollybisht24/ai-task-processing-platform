const { getRedisClient } = require('../config/redis');
const env = require('../config/env');
const logger = require('../utils/logger');

class QueueService {
  constructor() {
    this.streamKey = env.STREAM_KEY;
    this.consumerGroup = env.CONSUMER_GROUP;
    this.initialized = false;
  }

  /**
   * Initializes Redis Stream and Consumer Group if not already present
   */
  async initQueue() {
    if (this.initialized) return;

    const redis = getRedisClient();
    try {
      // Create consumer group; MKSTREAM ensures the stream is created if it does not exist
      await redis.xgroup('CREATE', this.streamKey, this.consumerGroup, '$', 'MKSTREAM');
      logger.info(`Redis Stream consumer group '${this.consumerGroup}' created on '${this.streamKey}'`);
      this.initialized = true;
    } catch (err) {
      if (err.message && err.message.includes('BUSYGROUP')) {
        // Consumer group already exists - perfectly normal
        this.initialized = true;
        logger.debug(`Redis Stream consumer group '${this.consumerGroup}' already exists.`);
      } else {
        logger.error(`Error initializing Redis Stream queue: ${err.message}`);
      }
    }
  }

  /**
   * Pushes a task job into the Redis Stream
   * @param {Object} jobData
   * @returns {Promise<string>} Redis stream message ID
   */
  async enqueueTask(jobData) {
    const redis = getRedisClient();
    await this.initQueue();

    const payload = [
      'taskId', jobData.taskId.toString(),
      'operation', jobData.operation,
      'retryCount', String(jobData.retryCount || 0),
      'enqueuedAt', new Date().toISOString()
    ];

    try {
      const messageId = await redis.xadd(this.streamKey, '*', ...payload);
      logger.info(`Task [${jobData.taskId}] enqueued to Redis Stream '${this.streamKey}' with message ID: ${messageId}`);
      return messageId;
    } catch (error) {
      logger.error(`Failed to enqueue task [${jobData.taskId}] to Redis Stream: ${error.message}`);
      throw error;
    }
  }

  /**
   * Returns current queue statistics
   */
  async getQueueStats() {
    const redis = getRedisClient();
    try {
      const streamLen = await redis.xlen(this.streamKey);
      const groups = await redis.xinfo('GROUPS', this.streamKey).catch(() => []);
      return {
        streamKey: this.streamKey,
        length: streamLen,
        groups
      };
    } catch (error) {
      return { error: error.message };
    }
  }
}

module.exports = new QueueService();
