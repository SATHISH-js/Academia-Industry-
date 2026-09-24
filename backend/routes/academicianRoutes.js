const express = require('express');
const router = express.Router();

const {
  getAcademicianProfile,
  updateAcademicianProfile,
  getAcademicianOpportunities,
  getDepartmentList,
  getAcademicianStudents,
  getStudentMonitoringDetail,
  getStudentGuidanceMessages,
  sendStudentGuidanceMessage,
  getInstitutionDirectives,
  acknowledgeDirective,
  toggleGuestLectureAvailability,
  getGuestLectureDirectory,
  getFacultyGuestLectures,
  requestFacultyGuestLecture,
  updateFacultyGuestLectureStatus
} = require('../controllers/academicianController');

const { authenticateUser } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.use(authenticateUser, requireRole('ACADEMICIAN'));

// Profile & Opportunities
router.get('/profile', getAcademicianProfile);
router.put('/profile', updateAcademicianProfile);
router.get('/opportunities', getAcademicianOpportunities);

// Department & Student Monitoring
router.get('/departments', getDepartmentList);
router.get('/students', getAcademicianStudents);
router.get('/students/:studentId', getStudentMonitoringDetail);
router.get('/students/:studentId/messages', getStudentGuidanceMessages);
router.post('/students/:studentId/messages', sendStudentGuidanceMessage);

// Institutional Commands & Directives
router.get('/directives', getInstitutionDirectives);
router.put('/directives/:id/status', acknowledgeDirective);

// Guest Lecture Exchange & Directory
router.put('/guest-lectures/toggle-availability', toggleGuestLectureAvailability);
router.get('/guest-lectures/speakers', getGuestLectureDirectory);
router.get('/guest-lectures', getFacultyGuestLectures);
router.post('/guest-lectures', requestFacultyGuestLecture);
router.put('/guest-lectures/:id/status', updateFacultyGuestLectureStatus);

module.exports = router;
