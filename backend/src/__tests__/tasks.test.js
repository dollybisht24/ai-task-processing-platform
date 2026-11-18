const request = require('supertest');
const app = require('../app');
const Task = require('../models/Task');
require('./setup');

describe('Task Management API Endpoints', () => {
  let user1Token;
  let user2Token;
  let user1Id;
  let user2Id;

  beforeEach(async () => {
    // Register User 1
    const res1 = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'User One',
        email: 'user1@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!'
      });
    user1Token = res1.body.data.token;
    user1Id = res1.body.data.user._id;

    // Register User 2
    const res2 = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'User Two',
        email: 'user2@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!'
      });
    user2Token = res2.body.data.token;
    user2Id = res2.body.data.user._id;
  });

  describe('POST /api/tasks', () => {
    it('should create an UPPERCASE task and return pending status', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          title: 'Uppercase Test',
          inputText: 'Hello Dolly, Welcome to AI Platform!',
          operation: 'UPPERCASE'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.taskId).toBeDefined();
      expect(res.body.data.status).toBe('pending');
      expect(res.body.data.operation).toBe('UPPERCASE');
      expect(res.body.data.logs.length).toBeGreaterThan(0);
    });

    it('should normalize operation case and spacing (e.g. "reverse string")', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          title: 'Reverse Test',
          inputText: 'Hello World',
          operation: 'reverse string'
        });

      expect(res.status).toBe(201);
      expect(res.body.data.operation).toBe('REVERSE_STRING');
    });

    it('should reject invalid operation', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          title: 'Invalid Op',
          inputText: 'Some text',
          operation: 'INVALID_OP'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/tasks and GET /api/tasks/stats', () => {
    beforeEach(async () => {
      // Create 3 tasks for user1
      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ title: 'Task A', inputText: 'Text A', operation: 'UPPERCASE' });

      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ title: 'Task B', inputText: 'Text B', operation: 'LOWERCASE' });

      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ title: 'Task C', inputText: 'Text C', operation: 'WORD_COUNT' });
    });

    it('should list tasks for authenticated user with pagination', async () => {
      const res = await request(app)
        .get('/api/tasks?page=1&limit=2')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
      expect(res.body.pagination.totalTasks).toBe(3);
      expect(res.body.pagination.totalPages).toBe(2);
    });

    it('should filter tasks by search query', async () => {
      const res = await request(app)
        .get('/api/tasks?search=Task A')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].title).toBe('Task A');
    });

    it('should return correct user task statistics', async () => {
      const res = await request(app)
        .get('/api/tasks/stats')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.total).toBe(3);
      expect(res.body.data.pending).toBe(3);
      expect(res.body.data.success).toBe(0);
      expect(res.body.data.failed).toBe(0);
    });
  });

  describe('Task Ownership and Security Protection', () => {
    let user1TaskId;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ title: 'Secret Task', inputText: 'Private', operation: 'UPPERCASE' });
      user1TaskId = res.body.data.taskId;
    });

    it('should allow user1 to view their own task', async () => {
      const res = await request(app)
        .get(`/api/tasks/${user1TaskId}`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.taskId).toBe(user1TaskId);
    });

    it('should prevent user2 from viewing user1 task (404 / access denied)', async () => {
      const res = await request(app)
        .get(`/api/tasks/${user1TaskId}`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should prevent user2 from accessing user1 task logs', async () => {
      const res = await request(app)
        .get(`/api/tasks/${user1TaskId}/logs`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(res.status).toBe(404);
    });

    it('should prevent user2 from retrying user1 task', async () => {
      const res = await request(app)
        .post(`/api/tasks/${user1TaskId}/retry`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/tasks/:id/retry', () => {
    it('should reset failed task status to pending and increment retryCount', async () => {
      // Create and manually mark task as failed
      const createRes = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ title: 'Failing Task', inputText: 'Will fail', operation: 'UPPERCASE' });
      const taskId = createRes.body.data.taskId;

      await Task.findByIdAndUpdate(taskId, {
        status: 'failed',
        errorMessage: 'Simulated worker crash'
      });

      const retryRes = await request(app)
        .post(`/api/tasks/${taskId}/retry`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(retryRes.status).toBe(200);
      expect(retryRes.body.data.status).toBe('pending');
      expect(retryRes.body.data.retryCount).toBe(1);
      expect(retryRes.body.data.errorMessage).toBeNull();
    });
  });
});
