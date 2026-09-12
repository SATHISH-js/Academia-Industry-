const express = require('express');
const router = express.Router();

const {
  getOpportunityCandidates,
  getRecommendedInternships
} = require('../controllers/recommendationController');

const { authenticateUser } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.use(authenticateUser);

router.get('/internships', requireRole('STUDENT'), getRecommendedInternships);
router.get('/candidates/:type/:id', requireRole('INDUSTRY'), getOpportunityCandidates);

module.exports = router;
