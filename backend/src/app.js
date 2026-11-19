const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const env = require('./config/env');
const { apiLimiter } = require('./middleware/rateLimiter');
const { errorHandler, notFoundHandler } = require('./middleware/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const healthRoutes = require('./routes/healthRoutes');

const app = express();

// Enable trust proxy (Nginx / Kubernetes Ingress) so req.ip and rate-limiters use real client IP
app.set('trust proxy', 1);

// Security headers
app.use(helmet());

// Cross-Origin Resource Sharing configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin) return callback(null, true);
      // In development, allow localhost on any port or configured CLIENT_URL
      if (env.NODE_ENV === 'development' || origin === env.CLIENT_URL || origin.includes('localhost')) {
        return callback(null, true);
      }
      return callback(new Error('Blocked by CORS policy'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

// Body and Cookie Parsers
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser());

// 1. Health check endpoints (unthrottled for Docker & K8s probes)
app.use('/api', healthRoutes);

// 2. Rate limiter on application endpoints (disabled in test environment)
if (env.NODE_ENV !== 'test') {
  app.use('/api', apiLimiter);
}

// 3. Application Route Registration
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Root informational endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'AI Task Processing Platform API',
    status: 'running',
    version: '1.0.0',
    documentation: '/api/health'
  });
});

// 404 and Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
