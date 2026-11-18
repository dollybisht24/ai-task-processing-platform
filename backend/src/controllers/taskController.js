const taskService = require('../services/taskService');
const { successResponse } = require('../utils/apiResponse');

const createTask = async (req, res, next) => {
  try {
    const { title, inputText, operation } = req.body;
    const task = await taskService.createTask(req.user._id, {
      title,
      inputText,
      operation
    });

    return successResponse(res, task, 'Task created and submitted to queue successfully', 201);
  } catch (error) {
    next(error);
  }
};

const getTasks = async (req, res, next) => {
  try {
    const { tasks, pagination } = await taskService.getUserTasks(req.user._id, req.query);
    return successResponse(res, tasks, 'Tasks retrieved successfully', 200, pagination);
  } catch (error) {
    next(error);
  }
};

const getTaskById = async (req, res, next) => {
  try {
    const task = await taskService.getTaskById(req.user._id, req.params.id);
    return successResponse(res, task, 'Task retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const getTaskLogs = async (req, res, next) => {
  try {
    const logsData = await taskService.getTaskLogs(req.user._id, req.params.id);
    return successResponse(res, logsData, 'Task logs retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const getStats = async (req, res, next) => {
  try {
    const stats = await taskService.getUserTaskStats(req.user._id);
    return successResponse(res, stats, 'User task statistics retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const retryTask = async (req, res, next) => {
  try {
    const task = await taskService.retryTask(req.user._id, req.params.id);
    return successResponse(res, task, 'Task queued for retry successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  getTaskLogs,
  getStats,
  retryTask
};
