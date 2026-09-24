const express = require('express');
const router = express.Router();

const { getResumeData, getResumeDataByStudentId, logResumeExport } = require('../controllers/resumeController');
const { authenticateUser, optionalAuth } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// Public / HR candidate resume lookup by student ID
router.get('/student/:studentId', optionalAuth, getResumeDataByStudentId);

// Logged-in student's personal resume builder data
router.get('/data', authenticateUser, requireRole('STUDENT'), getResumeData);
router.post('/export-log', optionalAuth, logResumeExport);

module.exports = router;
