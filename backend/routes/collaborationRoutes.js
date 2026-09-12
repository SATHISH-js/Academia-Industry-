const express = require('express');
const router = express.Router();

const {
  listCollaborations,
  createMentorship,
  createWorkshop
} = require('../controllers/collaborationController');

const { authenticateUser } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.get('/', listCollaborations);
router.post('/mentorships', authenticateUser, requireRole('INDUSTRY'), createMentorship);
router.post('/workshops', authenticateUser, requireRole('INDUSTRY'), createWorkshop);

module.exports = router;
