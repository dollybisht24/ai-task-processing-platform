const express = require('express');
const taskController = require('../controllers/taskController');
const authenticate = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { createTaskSchema, taskQuerySchema } = require('../validators/taskValidator');

const router = express.Router();

// All task routes require authentication
router.use(authenticate);

router.post('/', validate(createTaskSchema), taskController.createTask);
router.get('/', validate(taskQuerySchema, 'query'), taskController.getTasks);
router.get('/stats', taskController.getStats);
router.get('/:id', taskController.getTaskById);
router.get('/:id/logs', taskController.getTaskLogs);
router.post('/:id/retry', taskController.retryTask);

module.exports = router;
