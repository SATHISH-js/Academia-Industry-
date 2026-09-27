const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { listUsers, setUserActive, setTrainerApproval } = require('../controllers/trainingController');

router.use(authenticateUser, requireRole('ADMIN'));
router.get('/users', listUsers);
router.patch('/users/:id/status', setUserActive);
router.patch('/trainers/:id/approval', setTrainerApproval);

module.exports = router;
