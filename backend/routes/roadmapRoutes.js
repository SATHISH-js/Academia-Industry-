const express = require('express');
const router = express.Router();

const {
  getRoadmaps,
  getRoadmapById,
  toggleTask,
  getTaskAssessment,
  submitTaskAssessment,
  generateCustomRoadmap,
  deleteCustomRoadmap
} = require('../controllers/roadmapController');

const { authenticateUser } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.use(authenticateUser);

router.get('/', getRoadmaps);
router.post('/generate', requireRole('STUDENT'), generateCustomRoadmap);
router.get('/:id', getRoadmapById);
router.delete('/:id', requireRole('STUDENT'), deleteCustomRoadmap);
router.post('/:id/tasks/:taskId/toggle', requireRole('STUDENT'), toggleTask);

// 20-Question Topic Assessment & Automatic Task Verification Routes (Requirement 1)
router.get('/:id/tasks/:taskId/assessment', requireRole('STUDENT'), getTaskAssessment);
router.post('/:id/tasks/:taskId/assessment/submit', requireRole('STUDENT'), submitTaskAssessment);

module.exports = router;
