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
  getPublicInstitutions,
  createInstitutionStudent,
  createInstitutionAcademician,
  getInstitutionDepartments,
  createInstitutionDepartment,
  searchIndustries,
  getIndustryTrainingPrograms,
  requestTrainingEnrollment,
  getPlacementFieldAnalytics
} = require('../controllers/institutionController');

const { authenticateUser } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// Public institution listing for student registration & profile selection
router.get('/public-list', getPublicInstitutions);

// Authenticated INSTITUTION Protected Routes
router.use(authenticateUser, requireRole('INSTITUTION'));

router.get('/analytics', getInstitutionAnalytics);

// Students
router.get('/students', getInstitutionStudents);
router.post('/students', createInstitutionStudent);
router.get('/students/:studentId/activity', getStudentActivityHistory);

// Academicians / Faculty
router.get('/academicians', getInstitutionAcademicians);
router.post('/academicians', createInstitutionAcademician);

// Dynamic Departments
router.get('/departments', getInstitutionDepartments);
router.post('/departments', createInstitutionDepartment);

// Industry Search (Autocomplete) & MoU
router.get('/industries-search', searchIndustries);
router.get('/partners', getInstitutionPartners);
router.post('/mou/propose', proposeMou);

// Training Programs (Industry-provided)
router.get('/training-programs', getIndustryTrainingPrograms);
router.post('/training-programs/enroll', requestTrainingEnrollment);

// Collaborations search (backward compatibility)
router.get('/collaborations/search', searchIndustryCollaborations);

// Placements Field Visual Analytics
router.get('/placements/analytics', getPlacementFieldAnalytics);

module.exports = router;
