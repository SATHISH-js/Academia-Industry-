const express = require('express');
const router = express.Router();

const {
  getRoadmaps,
  getRoadmapById,
  toggleTask
} = require('../controllers/roadmapController');

const { authenticateUser } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.use(authenticateUser);

router.get('/', getRoadmaps);
router.get('/:id', getRoadmapById);
router.post('/:id/tasks/:taskId/toggle', requireRole('STUDENT'), toggleTask);

module.exports = router;
