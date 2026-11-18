const mongoose = require('mongoose');
const { getRedisClient, disconnectRedis } = require('../config/redis');

// Set environment for testing
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://localhost:27017/ai_task_platform_test';
process.env.JWT_SECRET = 'test_secret_key_for_testing_purposes_only';

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI);
  }
  getRedisClient();
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }
  await disconnectRedis();
});

afterEach(async () => {
  // Clear collections between tests if connected
  if (mongoose.connection.readyState !== 0) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
});
