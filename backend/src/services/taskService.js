const Task = require('../models/Task');
const queueService = require('./queueService');
const logger = require('../utils/logger');

const recordQueueFailure = async (task, error, action) => {
  const message = `Failed to ${action} task in Redis queue: ${error.message}`;
  logger.error(`Task ${task._id}: ${message}`);
  task.status = 'failed';
  task.errorMessage = message;
  task.completedAt = new Date();
  task.logs.push({
    timestamp: new Date(),
    message,
    level: 'ERROR'
  });
  await task.save();

  error.statusCode = 503;
  error.isOperational = true;
  error.message = 'Task could not be submitted because the queue is unavailable.';
  throw error;
};

const createTask = async (userId, { title, inputText, operation }) => {
  const task = await Task.create({
    userId,
    title,
    inputText,
    operation,
    status: 'pending',
    logs: [
      {
        timestamp: new Date(),
        message: `Task initialized with operation ${operation}. Queuing job...`,
        level: 'INFO'
      }
    ]
  });

  try {
    await queueService.enqueueTask({
      taskId: task._id,
      operation: task.operation,
      retryCount: 0
    });
  } catch (queueErr) {
    await recordQueueFailure(task, queueErr, 'enqueue');
  }

  return task.toClientFormat();
};

const getUserTasks = async (userId, { page = 1, limit = 10, status, search, sortBy = 'createdAt', sortOrder = 'desc' }) => {
  const query = { userId };

  if (status) {
    query.status = status;
  }

  if (search && search.trim() !== '') {
    query.title = { $regex: search.trim(), $options: 'i' };
  }

  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
  const skip = (page - 1) * limit;

  const [tasks, total] = await Promise.all([
    Task.find(query).sort(sort).skip(skip).limit(limit).lean(),
    Task.countDocuments(query)
  ]);

  const formattedTasks = tasks.map((t) => ({
    taskId: t._id.toString(),
    title: t.title,
    inputText: t.inputText,
    operation: t.operation,
    status: t.status,
    result: t.result,
    errorMessage: t.errorMessage,
    retryCount: t.retryCount,
    startedAt: t.startedAt,
    completedAt: t.completedAt,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt
  }));

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    tasks: formattedTasks,
    pagination: {
      currentPage: page,
      limit,
      totalTasks: total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  };
};

const getTaskById = async (userId, taskId) => {
  const task = await Task.findOne({ _id: taskId, userId });
  if (!task) {
    const error = new Error('Task not found or access denied.');
    error.statusCode = 404;
    error.isOperational = true;
    throw error;
  }
  return task.toClientFormat();
};

const getTaskLogs = async (userId, taskId) => {
  const task = await Task.findOne({ _id: taskId, userId }).select('logs title status');
  if (!task) {
    const error = new Error('Task not found or access denied.');
    error.statusCode = 404;
    error.isOperational = true;
    throw error;
  }
  return {
    taskId: task._id.toString(),
    title: task.title,
    status: task.status,
    logs: task.logs
  };
};

const getUserTaskStats = async (userId) => {
  const stats = await Task.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const result = {
    total: 0,
    pending: 0,
    running: 0,
    success: 0,
    failed: 0
  };

  stats.forEach((item) => {
    if (result[item._id] !== undefined) {
      result[item._id] = item.count;
    }
    result.total += item.count;
  });

  return result;
};

const retryTask = async (userId, taskId) => {
  const task = await Task.findOne({ _id: taskId, userId });
  if (!task) {
    const error = new Error('Task not found or access denied.');
    error.statusCode = 404;
    error.isOperational = true;
    throw error;
  }

  // Reset task for retry
  task.retryCount += 1;
  task.status = 'pending';
  task.errorMessage = null;
  task.startedAt = null;
  task.completedAt = null;
  task.logs.push({
    timestamp: new Date(),
    message: `Manual retry initiated (Attempt #${task.retryCount}). Enqueueing back to processing stream.`,
    level: 'INFO'
  });

  await task.save();

  // Re-enqueue into Redis stream
  try {
    await queueService.enqueueTask({
      taskId: task._id,
      operation: task.operation,
      retryCount: task.retryCount
    });
  } catch (queueErr) {
    await recordQueueFailure(task, queueErr, 'retry');
  }

  return task.toClientFormat();
};

module.exports = {
  createTask,
  getUserTasks,
  getTaskById,
  getTaskLogs,
  getUserTaskStats,
  retryTask
};
