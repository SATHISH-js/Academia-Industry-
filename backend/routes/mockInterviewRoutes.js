const express = require('express');
const router = express.Router();

const {
  getInterviewPresets,
  getInterviewRoles,
  getInterviewQuestions,
  submitInterview,
  getInterviewHistory,
  getInterviewById
} = require('../controllers/mockInterviewController');

const { authenticateUser } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.use(authenticateUser);

router.get('/presets', getInterviewPresets);
router.get('/roles', getInterviewRoles);
router.get('/questions', getInterviewQuestions);
router.post('/submit', requireRole('STUDENT'), submitInterview);
router.get('/history', requireRole('STUDENT'), getInterviewHistory);
router.get('/history/:id', requireRole('STUDENT'), getInterviewById);

module.exports = router;
