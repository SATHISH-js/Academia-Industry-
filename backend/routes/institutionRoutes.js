const express = require('express');
const router = express.Router();

const {
  getInstitutionAnalytics,
  getInstitutionStudents,
  getStudentByRegisterNumber,
  getStudentActivityHistory,
  getInstitutionActivities,
  getInstitutionAcademicians,
  addInstitutionAcademician,
  contactStudent,
  contactAcademician,
  getSentMessages,
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
router.get('/activities', getInstitutionActivities);
router.get('/students', getInstitutionStudents);
router.get('/students/by-reg-number/:regNumber', getStudentByRegisterNumber);
router.get('/students/:studentId/activity', getStudentActivityHistory);
router.get('/academicians', getInstitutionAcademicians);
router.post('/academicians', addInstitutionAcademician);
router.post('/contact/student', contactStudent);
router.post('/contact/academician', contactAcademician);
router.get('/messages', getSentMessages);
router.get('/partners', getInstitutionPartners);
router.post('/mou/propose', proposeMou);
router.get('/collaborations/search', searchIndustryCollaborations);

module.exports = router;
