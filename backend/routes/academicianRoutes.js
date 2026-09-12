const express = require('express');
const router = express.Router();

const {
  getAcademicianProfile,
  updateAcademicianProfile,
  getAcademicianOpportunities
} = require('../controllers/academicianController');

const { authenticateUser } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.use(authenticateUser, requireRole('ACADEMICIAN'));

router.get('/profile', getAcademicianProfile);
router.put('/profile', updateAcademicianProfile);
router.get('/opportunities', getAcademicianOpportunities);

module.exports = router;
