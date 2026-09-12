const express = require('express');
const router = express.Router();

const {
  getInstitutionAnalytics,
  getInstitutionStudents,
  getInstitutionAcademicians,
  getInstitutionPartners
} = require('../controllers/institutionController');

const { authenticateUser } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.use(authenticateUser, requireRole('INSTITUTION'));

router.get('/analytics', getInstitutionAnalytics);
router.get('/students', getInstitutionStudents);
router.get('/academicians', getInstitutionAcademicians);
router.get('/partners', getInstitutionPartners);

module.exports = router;
