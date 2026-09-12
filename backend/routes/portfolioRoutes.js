const express = require('express');
const router = express.Router();

const {
  getPortfolio,
  addProject,
  addCertification
} = require('../controllers/portfolioController');

const { authenticateUser } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// Get personal portfolio
router.get('/', authenticateUser, getPortfolio);
// Get public portfolio by student ID
router.get('/:studentId', getPortfolio);

// Manage portfolio items
router.post('/projects', authenticateUser, requireRole('STUDENT'), addProject);
router.post('/certifications', authenticateUser, requireRole('STUDENT'), addCertification);

module.exports = router;
