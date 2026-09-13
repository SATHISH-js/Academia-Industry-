const express = require('express');
const router = express.Router();

const {
  getInstitutionAnalytics,
  getInstitutionStudents,
  getStudentActivityHistory,
  getInstitutionAcademicians,
  getInstitutionPartners,
  proposeMou,
  searchIndustryCollaborations,
  getPublicInstitutions
} = require('../controllers/institutionController');

const { authenticateUser } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// Public institution listing for student registration & profile selection
router.get('/public-list', getPublicInstitutions);

// Authenticated INSTITUTION Protected Routes
router.use(authenticateUser, requireRole('INSTITUTION'));

router.get('/analytics', getInstitutionAnalytics);
router.get('/students', getInstitutionStudents);
router.get('/students/:studentId/activity', getStudentActivityHistory);
router.get('/academicians', getInstitutionAcademicians);
router.get('/partners', getInstitutionPartners);
router.post('/mou/propose', proposeMou);
router.get('/collaborations/search', searchIndustryCollaborations);

module.exports = router;
