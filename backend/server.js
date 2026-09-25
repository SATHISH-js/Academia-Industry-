const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

const { pool, testConnection } = require('./config/db');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');
const { sendSuccess } = require('./utils/responseHandler');
const { initKeepAlive } = require('./utils/keepAlive');
const { ensureSchemaInitialized } = require('./database/autoMigrate');

// Route Handlers
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const assessmentRoutes = require('./routes/assessmentRoutes');
const skillRoutes = require('./routes/skillRoutes');
const internshipRoutes = require('./routes/internshipRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const academicianRoutes = require('./routes/academicianRoutes');
const institutionRoutes = require('./routes/institutionRoutes');
const collaborationRoutes = require('./routes/collaborationRoutes');
const portfolioRoutes = require('./routes/portfolioRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const roadmapRoutes = require('./routes/roadmapRoutes');
const mockInterviewRoutes = require('./routes/mockInterviewRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const activityRoutes = require('./routes/activityRoutes');
const industryRoutes = require('./routes/industryRoutes');
const certificateVerificationRoutes = require('./routes/certificateVerificationRoutes');
const coachNovaRoutes = require('./routes/coachNovaRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Utility Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health Check Endpoint
app.get('/api/health', async (req, res) => {
  const dbStatus = await testConnection();
  let activeDb = 'unknown';
  let tablesReady = false;
  
  if (dbStatus) {
    try {
      const [dbRow] = await pool.query('SELECT DATABASE() as currentDb');
      activeDb = dbRow[0]?.currentDb || 'unknown';
      const [check] = await pool.query(
        'SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = ? AND table_name = ?',
        [activeDb, 'users']
      );
      tablesReady = (check[0]?.count > 0);
    } catch (e) {
      console.warn('[Health Check] DB query error:', e.message);
    }
  }

  sendSuccess(res, {
    status: 'online',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    databaseConnected: dbStatus,
    activeDatabase: activeDb,
    tablesInitialized: tablesReady,
    version: '1.0.0'
  }, 'Academia-Industry Collaboration Portal API is healthy');
});

// Admin DB Init / Migration Endpoint
app.post('/api/admin/init-db', async (req, res) => {
  const success = await ensureSchemaInitialized();
  if (success) {
    return sendSuccess(res, { initialized: true }, 'Database schema verified and initialized successfully');
  }
  return res.status(500).json({ success: false, message: 'Database schema initialization failed' });
});

// Mount Feature API Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/internships', internshipRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/academician', academicianRoutes);
app.use('/api/institution', institutionRoutes);
app.use('/api/collaborations', collaborationRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/roadmaps', roadmapRoutes);
app.use('/api/mock-interview', mockInterviewRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/industry', industryRoutes);
app.use('/api/certificate-verify', certificateVerificationRoutes);
app.use('/api/coach-nova', coachNovaRoutes);

// Serve frontend static build in production (Single-service deployment)
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(frontendDist)) {
  console.log(`[Static Serve] Frontend build found at ${frontendDist}. Serving static assets.`);
  app.use(express.static(frontendDist));
  // Client-side SPA routing fallback: serve index.html for non-API and non-upload routes
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
} else {
  // Helpful root endpoint when running API-only mode
  app.get('/', (req, res) => {
    sendSuccess(res, {
      name: 'Academia-Industry Collaboration Portal API',
      status: 'online',
      endpoints: {
        health: '/api/health',
        auth: '/api/auth'
      }
    }, 'Backend API Server is running');
  });
}

// 404 & Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Start Server
const server = app.listen(PORT, async () => {
  console.log(`====================================================`);
  console.log(`Academia–Industry Collaboration Portal Backend Server`);
  console.log(`Running on: http://localhost:${PORT}`);
  console.log(`Health Check: http://localhost:${PORT}/api/health`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`====================================================`);
  await testConnection();
  // Automatically check and initialize schema/tables if missing (e.g. fresh cloud DB)
  await ensureSchemaInitialized();
  // Initialize keep-alive self-ping to prevent Render 15-minute spin-down
  initKeepAlive();
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[Server Error] Port ${PORT} is already in use by another running process.`);
    console.error(`Please close any existing Node instances using port ${PORT}, or set a different PORT in .env (e.g. PORT=5001).`);
  } else {
    console.error(`[Server Error]`, err.message);
  }
});

module.exports = app;
