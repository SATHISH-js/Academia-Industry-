const express = require('express');
const router = express.Router();

const {
  getStudentProfile,
  updateStudentProfile,
  getStudentSkills,
  getStudentSkillGaps,
  getDashboardSummary,
  getStudentCertifications,
  addStudentCertification,
  updateStudentCertification,
  deleteStudentCertification
} = require('../controllers/studentController');

const { authenticateUser } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// All student routes require authentication and STUDENT role
router.use(authenticateUser, requireRole('STUDENT'));

router.get('/profile', getStudentProfile);
router.put('/profile', updateStudentProfile);
router.get('/skills', getStudentSkills);
router.get('/skill-gap', getStudentSkillGaps);
router.get('/dashboard-summary', getDashboardSummary);

// Student Certifications & Extra-Curricular Achievements routes
router.get('/certifications', getStudentCertifications);
router.post('/certifications', addStudentCertification);
router.put('/certifications/:id', updateStudentCertification);
router.delete('/certifications/:id', deleteStudentCertification);

module.exports = router;
