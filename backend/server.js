const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const { testConnection } = require('./config/db');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');
const { sendSuccess } = require('./utils/responseHandler');

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
  sendSuccess(res, {
    status: 'online',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    databaseConnected: dbStatus,
    version: '1.0.0'
  }, 'Academia-Industry Collaboration Portal API is healthy');
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

// 404 & Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Start Server
app.listen(PORT, async () => {
  console.log(`====================================================`);
  console.log(`Academia–Industry Collaboration Portal Backend Server`);
  console.log(`Running on: http://localhost:${PORT}`);
  console.log(`Health Check: http://localhost:${PORT}/api/health`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`====================================================`);
  await testConnection();
});

module.exports = app;
