const express = require('express');
const router = express.Router();

const {
  listAssessments,
  getAssessmentById,
  submitAssessment,
  getLearningRecommendations
} = require('../controllers/assessmentController');

const { authenticateUser } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// Public listing
router.get('/', listAssessments);
router.get('/recommendations', authenticateUser, getLearningRecommendations);
router.get('/:id', authenticateUser, getAssessmentById);
router.post('/:id/submit', authenticateUser, requireRole('STUDENT'), submitAssessment);

module.exports = router;
