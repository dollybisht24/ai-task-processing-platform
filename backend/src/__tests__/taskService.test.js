jest.mock('../models/Task', () => ({
  create: jest.fn()
}));
jest.mock('../services/queueService', () => ({
  enqueueTask: jest.fn()
}));
jest.mock('../utils/logger', () => ({
  error: jest.fn()
}));

const Task = require('../models/Task');
const queueService = require('../services/queueService');
const taskService = require('../services/taskService');

describe('Task queue submission failures', () => {
  it('marks a task failed and returns an unavailable error when enqueue fails', async () => {
    const task = {
      _id: 'task-123',
      logs: [],
      save: jest.fn().mockResolvedValue(undefined),
      toClientFormat: jest.fn()
    };
    Task.create.mockResolvedValue(task);
    queueService.enqueueTask.mockRejectedValue(new Error('Redis unavailable'));

    await expect(
      taskService.createTask('user-123', {
        title: 'Test',
        inputText: 'text',
        operation: 'UPPERCASE'
      })
    ).rejects.toMatchObject({
      statusCode: 503,
      isOperational: true,
      message: 'Task could not be submitted because the queue is unavailable.'
    });

    expect(task.status).toBe('failed');
    expect(task.errorMessage).toContain('Redis unavailable');
    expect(task.completedAt).toBeInstanceOf(Date);
    expect(task.logs.at(-1)).toMatchObject({
      level: 'ERROR',
      message: expect.stringContaining('Redis unavailable')
    });
    expect(task.save).toHaveBeenCalledTimes(1);
  });
});
