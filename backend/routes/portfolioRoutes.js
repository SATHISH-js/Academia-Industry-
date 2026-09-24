const express = require('express');
const router = express.Router();

const {
  getPortfolio,
  addProject,
  updateProject,
  deleteProject,
  addInternship,
  deleteInternship,
  addCertification
} = require('../controllers/portfolioController');

const { authenticateUser } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// Get personal portfolio
router.get('/', authenticateUser, getPortfolio);
// Get public portfolio by student ID (no login required for viewers)
router.get('/:studentId', getPortfolio);

// Manage portfolio projects
router.post('/projects', authenticateUser, requireRole('STUDENT'), addProject);
router.put('/projects/:id', authenticateUser, requireRole('STUDENT'), updateProject);
router.delete('/projects/:id', authenticateUser, requireRole('STUDENT'), deleteProject);

// Manage portfolio internships
router.post('/internships', authenticateUser, requireRole('STUDENT'), addInternship);
router.delete('/internships/:id', authenticateUser, requireRole('STUDENT'), deleteInternship);

// Manage portfolio certifications
router.post('/certifications', authenticateUser, requireRole('STUDENT'), addCertification);

module.exports = router;
